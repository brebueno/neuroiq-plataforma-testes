import Stripe from 'stripe';
import { supabaseAdmin } from './_supabase.js';
import { rateLimit, clientIp } from './_ratelimit.js';

// 1º acesso pós-pagamento. Cria a conta PELO SERVIDOR (service role) já
// CONFIRMADA (email_confirm: true) — sem email de confirmação, imune ao rate
// limit do mailer e ao setting "Confirm email".
//
// SEGURANÇA (corrigido pós-pentest):
//   - O email vem SEMPRE da sessão Stripe (o pagador), NUNCA do body. Impede
//     que alguém use um session_id pago pra criar/sequestrar a conta de outra
//     pessoa com email arbitrário.
//   - Idempotência: se já existe profile com aquele stripe_customer_id, a sessão
//     já foi consumida -> 409. Impede replay (1 pagamento -> N contas).
//   - Rate limit por IP.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = clientIp(req);
  if (!rateLimit(`signup:${ip}`, { limit: 10, windowMs: 60000 }).ok) {
    res.status(429).json({ error: 'Muitas tentativas. Aguarde um instante.' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const admin = supabaseAdmin();
  if (!secret || !admin) {
    res.status(500).json({ error: 'Backend não configurado (Stripe/Supabase).' });
    return;
  }

  const b = req.body && typeof req.body === 'object' ? req.body : {};
  const sessionId = typeof b.session_id === 'string' ? b.session_id : '';
  const password = typeof b.password === 'string' ? b.password : '';
  if (!sessionId || password.length < 6) {
    res.status(400).json({ error: 'session_id e senha (mín. 6) são obrigatórios.' });
    return;
  }

  // 1) Pagamento: a Stripe confirma que a sessão foi concluída.
  const stripe = new Stripe(secret, { httpClient: Stripe.createFetchHttpClient() });
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
  } catch {
    res.status(400).json({ error: 'Sessão de pagamento não encontrada.' });
    return;
  }
  const paid = session.status === 'complete' || session.payment_status === 'paid';
  if (!paid) {
    res.status(402).json({ error: 'Pagamento não confirmado para esta sessão.' });
    return;
  }

  // 2) Email SEMPRE da sessão (o pagador). Nunca confia no body.
  const email = (session.customer_details && session.customer_details.email) || session.customer_email || '';
  if (!email) {
    res.status(400).json({ error: 'Sessão sem email. Fale com o suporte.' });
    return;
  }
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;

  // 3) Idempotência: essa sessão/customer já virou conta? Então rejeita replay.
  if (customerId) {
    const { data: existing } = await admin.from('profiles').select('id').eq('stripe_customer_id', customerId).limit(1);
    if (existing && existing.length) {
      res.status(409).json({ code: 'exists', email, error: 'Esse pagamento já tem uma conta. Entre com sua senha.' });
      return;
    }
  }

  // 4) Cria a conta já confirmada (sem email de confirmação).
  const md = session.metadata || {};
  const fullName = md.name ? String(md.name).slice(0, 200) : undefined;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : {},
  });

  if (createErr) {
    if (/registered|already|exists/i.test(createErr.message)) {
      res.status(409).json({ code: 'exists', email, error: 'Já existe uma conta com esse email. Entre com sua senha.' });
      return;
    }
    console.error('[complete-signup] createUser', createErr.message);
    res.status(500).json({ error: 'Não foi possível criar sua conta. Tente novamente.' });
    return;
  }
  const userId = created?.user?.id;
  if (!userId) {
    res.status(500).json({ error: 'Falha ao criar a conta.' });
    return;
  }

  // 5) Ativa a assinatura + linka o customer no profile (service role).
  const sub = session.subscription && typeof session.subscription === 'object' ? session.subscription : null;
  const status = sub?.status || 'active';
  const endsAt = sub?.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

  const patch = { subscription_status: status, subscription_ends_at: endsAt, stripe_customer_id: customerId };
  if (fullName) patch.full_name = fullName;
  const { error: upErr } = await admin.from('profiles').update(patch).eq('id', userId);
  if (upErr) console.error('[complete-signup] update profile', upErr.message);

  res.status(200).json({ ok: true, email, subscription_status: status });
}
