import { sendMetaEvent, buildUserData, clientIpFrom } from './_capi.js';

// Recebe eventos do browser (src/lib/tracking.ts) e reenvia pela Conversions API
// com o MESMO event_id -> dedup com o Pixel. Server-side sobrevive a ad-blocker,
// iOS ATT e à janela curta de cookie do Safari.
//
// Sempre responde 200 (mesmo em erro): tracking não pode quebrar o front.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const { eventName, eventId, eventSourceUrl, customData = {}, userData = {}, fbp, fbc } = b;

    if (!eventName || !eventId) {
      res.status(400).json({ error: 'eventName e eventId são obrigatórios' });
      return;
    }

    const ud = buildUserData({
      email: userData.email,
      phone: userData.phone,
      externalId: userData.externalId,
      fbp,
      fbc,
      clientIp: clientIpFrom(req),
      userAgent: req.headers['user-agent'],
    });

    await sendMetaEvent({
      eventName,
      eventId,
      eventSourceUrl,
      actionSource: 'website',
      userData: ud,
      customData,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[track] erro', err);
    res.status(200).json({ ok: false });
  }
}
