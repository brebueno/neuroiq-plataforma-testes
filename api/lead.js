// Lead capture (stub). Recebe o e-mail capturado antes do reveal e é onde você
// pluga o ESP/CRM (Brevo, ActiveCampaign, Mailchimp, etc.) com uma tag tipo
// "fez o teste, nao pagou" pra disparar a sequência de recuperação de abandono.
//
// TODO (backend): substituir o console.log por uma chamada ao seu ESP.
// Ex.: await fetch('https://api.brevo.com/v3/contacts', { headers: { 'api-key': process.env.BREVO_API_KEY }, ... })
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { email, event } = req.body || {};
    // Valida formato antes de aceitar (evita log/ESP injection e lixo na base).
    const validEmail = typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 254;
    if (!validEmail) {
      res.status(400).json({ error: 'email required' });
      return;
    }
    const safeEvent = typeof event === 'string' ? event.replace(/[^\w-]/g, '').slice(0, 40) : 'unknown';
    // eslint-disable-next-line no-console
    console.log('[lead]', safeEvent, email);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'lead capture failed' });
  }
}
