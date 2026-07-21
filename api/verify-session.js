import Stripe from 'stripe';
import { rateLimit, clientIp } from './_ratelimit.js';

// Desbloqueio à prova de adulteração: o front chama isto na volta do Checkout
// com o session_id; perguntamos à STRIPE se a sessão foi concluída (ninguém
// destrava com ?paid=1 na URL).
//
// SEGURANÇA (pós-pentest): NÃO retorna mais o email (PII) — o session_id vaza na
// URL/print/log, e devolver o email do pagador ali era vazamento + oráculo de
// enumeração. O email é derivado server-side dentro do complete-signup, a partir
// da própria sessão. Erros são genéricos (sem distinguir id válido/ inválido).
export default async function handler(req, res) {
  const ip = clientIp(req);
  if (!rateLimit(`verify:${ip}`, { limit: 30, windowMs: 60000 }).ok) {
    res.status(429).json({ paid: false });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ paid: false });
    return;
  }

  const sessionId = req.query?.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ paid: false });
    return;
  }

  const stripe = new Stripe(secret, { httpClient: Stripe.createFetchHttpClient() });
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = s.status === 'complete' || s.payment_status === 'paid';
    // amountTotal/currency = preço público (não é PII). Sem email, sem status cru.
    res.status(200).json({ paid: Boolean(paid), amountTotal: s.amount_total, currency: s.currency });
  } catch (err) {
    console.error('[verify-session]', err instanceof Error ? err.message : err);
    res.status(200).json({ paid: false }); // genérico: não vira oráculo de enumeração
  }
}
