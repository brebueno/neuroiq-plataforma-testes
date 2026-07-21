import Stripe from 'stripe';
import { sendMetaEvent, buildUserData, clientIpFrom } from './_capi.js';
import { rateLimit } from './_ratelimit.js';

// Recebe eventos do browser e reenvia pela Conversions API com o MESMO event_id
// (dedup com o Pixel). Sempre responde 200 (tracking não pode quebrar o front).
//
// SEGURANÇA (pós-pentest): allowlist de eventos + rate limit + o evento-dinheiro
// (Purchase) SÓ é repassado se a Stripe confirmar o pagamento, e com o VALOR DA
// STRIPE (nunca o valor mandado pelo cliente) — fecha o relay aberto que
// permitia floodar Purchase falso e envenenar a otimização de campanha.
const ALLOWED = new Set(['PageView', 'ViewContent', 'Lead', 'InitiateCheckout', 'CompleteRegistration', 'Purchase', 'Subscribe']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const ip = clientIpFrom(req) || 'unknown';
  if (!rateLimit(`track:${ip}`, { limit: 40, windowMs: 60000 }).ok) {
    res.status(429).json({ ok: false });
    return;
  }

  try {
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const { eventName, eventId, eventSourceUrl, customData = {}, userData = {}, fbp, fbc } = b;
    if (!eventName || !eventId) {
      res.status(400).json({ error: 'eventName e eventId são obrigatórios' });
      return;
    }
    if (!ALLOWED.has(eventName)) {
      res.status(200).json({ ok: false, ignored: true });
      return;
    }

    let outCustom = customData;
    if (eventName === 'Purchase') {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) { res.status(200).json({ ok: false }); return; }
      try {
        const stripe = new Stripe(secret, { httpClient: Stripe.createFetchHttpClient() });
        const s = await stripe.checkout.sessions.retrieve(eventId); // eventId = session_id
        const paid = s.status === 'complete' || s.payment_status === 'paid';
        if (!paid) { res.status(200).json({ ok: false, reason: 'unverified' }); return; }
        // Valor sempre da Stripe, nunca do cliente.
        outCustom = {
          value: (s.amount_total ?? 0) / 100,
          currency: (s.currency || 'brl').toUpperCase(),
          content_name: 'assinatura_qimind',
        };
      } catch {
        res.status(200).json({ ok: false, reason: 'unverified' });
        return;
      }
    }

    const ud = buildUserData({
      email: userData.email,
      phone: userData.phone,
      externalId: userData.externalId,
      fbp,
      fbc,
      clientIp: ip,
      userAgent: req.headers['user-agent'],
    });

    await sendMetaEvent({ eventName, eventId, eventSourceUrl, actionSource: 'website', userData: ud, customData: outCustom });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[track] erro', err);
    res.status(200).json({ ok: false });
  }
}
