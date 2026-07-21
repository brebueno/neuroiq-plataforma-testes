import Stripe from 'stripe';
import { rateLimit, clientIp } from './_ratelimit.js';

// Vercel serverless function: cria uma Stripe Checkout Session (assinatura).
// A chave SECRETA nunca fica no frontend nem no repo, só aqui, via env var da
// Vercel (Settings → Environment Variables).
//
// MODELO "entrada paga": R$7 agora (7 dias) → R$159/mês depois.
//   - STRIPE_PRICE_TRIAL   -> preço AVULSO (one-time) de R$7,00 (cobrado no checkout)
//   - STRIPE_PRICE_MONTHLY -> preço RECORRENTE de R$159,00/mês
//   - STRIPE_TRIAL_DAYS    -> dias de trial no recorrente (default 7). Como há um
//                             item avulso, o R$7 é cobrado agora e o R$159 só no
//                             fim do trial.
// Env obrigatória: STRIPE_SECRET_KEY + STRIPE_PRICE_MONTHLY (trial é opcional).

// Copia os identificadores de anúncio (fbp/fbc/click-ids/UTM) pro metadata da
// sessão. O stripe-webhook usa isso pra disparar o Purchase server-side com o
// mesmo match. Stripe exige valores string (<= 500 chars).
function toTrackingMetadata(a) {
  if (!a || typeof a !== 'object') return {};
  const keys = ['fbp', 'fbc', 'fbclid', 'gclid', 'gbraid', 'wbraid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'event_source_url'];
  const out = {};
  for (const k of keys) {
    const v = a[k];
    if (typeof v === 'string' && v) out[k] = v.slice(0, 500);
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!rateLimit(`checkout:${clientIp(req)}`, { limit: 20, windowMs: 60000 }).ok) {
    res.status(429).json({ error: 'Muitas tentativas. Aguarde um instante.' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceMonthly = process.env.STRIPE_PRICE_MONTHLY;
  const priceTrial = process.env.STRIPE_PRICE_TRIAL; // opcional (one-time R$7)
  if (!secret || !priceMonthly) {
    res.status(500).json({
      error: 'Stripe não configurado. Defina STRIPE_SECRET_KEY e STRIPE_PRICE_MONTHLY nas Environment Variables da Vercel.',
    });
    return;
  }

  // Fetch client evita StripeConnectionError na Vercel.
  const stripe = new Stripe(secret, { httpClient: Stripe.createFetchHttpClient() });
  // SEGURANÇA: em produção defina PUBLIC_APP_URL (ex: https://qimind.app) pra NÃO
  // confiar no header Origin/Host (evita open redirect no return_url pós-pagamento).
  const rawOrigin = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : '');
  const origin = process.env.PUBLIC_APP_URL || rawOrigin;
  const trialDays = Number(process.env.STRIPE_TRIAL_DAYS ?? 7);
  const email = req.body && typeof req.body === 'object' ? req.body.email : undefined;
  const wantsBump = req.body && typeof req.body === 'object' ? req.body.bump === true : false;
  const wantsAnnual = req.body && typeof req.body === 'object' ? req.body.plan === 'annual' : false;
  const priceBump = process.env.STRIPE_PRICE_BUMP; // one-time (order bump), opcional
  const priceAnnual = process.env.STRIPE_PRICE_ANNUAL; // recorrente anual (upsell), opcional
  const trackingMeta = toTrackingMetadata(
    req.body && typeof req.body === 'object' ? req.body.attribution : undefined,
  );

  // Lead (nome/telefone) + demografia (gênero/faixa etária) no metadata: o
  // stripe-webhook usa isso pra popular `profiles` no Supabase e reconciliar a
  // conta criada no 1º acesso (por email). Stripe exige strings (<= 500 chars).
  const lead = req.body && typeof req.body === 'object' && req.body.lead ? req.body.lead : {};
  const demo = req.body && typeof req.body === 'object' && req.body.demographics ? req.body.demographics : {};
  const leadMeta = {};
  if (typeof lead.name === 'string' && lead.name) leadMeta.name = lead.name.slice(0, 500);
  if (typeof lead.phone === 'string' && lead.phone) leadMeta.phone = lead.phone.slice(0, 500);
  if (typeof demo.gender === 'string' && demo.gender) leadMeta.gender = demo.gender.slice(0, 50);
  if (typeof demo.ageBand === 'string' && demo.ageBand) leadMeta.age_band = demo.ageBand.slice(0, 50);
  const meta = { ...trackingMeta, ...leadMeta };

  // Recorrente: anual (upsell) se escolhido e configurado, senão mensal.
  const recurring = wantsAnnual && priceAnnual ? priceAnnual : priceMonthly;
  const lineItems = [{ price: recurring, quantity: 1 }];
  if (priceTrial) lineItems.unshift({ price: priceTrial, quantity: 1 });
  if (wantsBump && priceBump) lineItems.unshift({ price: priceBump, quantity: 1 });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      // Trial no recorrente: o R$159 só é cobrado após `trialDays`. O item avulso
      // (R$7) entra na 1ª fatura e é cobrado agora, no checkout.
      subscription_data: {
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
        metadata: meta,
      },
      customer_email: email || (typeof lead.email === 'string' ? lead.email : undefined) || undefined,
      allow_promotion_codes: true,
      ui_mode: 'embedded_page',
      metadata: meta,
      return_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
    });
    res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('[create-checkout-session]', err);
    res.status(500).json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
  }
}
