import crypto from 'crypto';

// Sender compartilhado da Meta Conversions API (server-side).
// Usado por /api/track (eventos do funil vindos do browser) e pelo
// stripe-webhook (Purchase/Subscribe = fonte de verdade). Arquivo com prefixo
// "_" pra Vercel NÃO tratar como rota HTTP.
//
// Env (Vercel → Settings → Environment Variables):
//   META_PIXEL_ID        1037768161943603
//   META_CAPI_TOKEN      token da Conversions API (Events Manager → Configurações)
//   META_TEST_EVENT_CODE opcional, pra ver os eventos em "Testar eventos"
//
// Nunca lança pra fora: tracking não pode derrubar checkout nem webhook.

const GRAPH_VERSION = 'v21.0';

const sha256 = (v) => crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');

// Meta exige PII em SHA-256. Email: trim+lowercase. Telefone: só dígitos (com DDI).
function hashEmail(email) {
  if (!email || typeof email !== 'string') return undefined;
  const e = email.trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? [sha256(e)] : undefined;
}
function hashPhone(phone) {
  if (!phone) return undefined;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 8 ? [sha256(digits)] : undefined;
}

// Monta user_data com o máximo de sinais (quanto mais, maior o Event Match
// Quality). fbp/fbc NÃO são hasheados. IP + User-Agent melhoram o match.
export function buildUserData({ email, phone, externalId, fbp, fbc, clientIp, userAgent } = {}) {
  const ud = {};
  const em = hashEmail(email);
  if (em) ud.em = em;
  const ph = hashPhone(phone);
  if (ph) ud.ph = ph;
  if (externalId) ud.external_id = [sha256(externalId)];
  if (fbp) ud.fbp = fbp;
  if (fbc) ud.fbc = fbc;
  if (clientIp) ud.client_ip_address = clientIp;
  if (userAgent) ud.client_user_agent = userAgent;
  return ud;
}

// IP real do cliente numa function da Vercel (atrás de proxy).
export function clientIpFrom(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || undefined;
}

export async function sendMetaEvent({
  eventName,
  eventId,
  eventSourceUrl,
  actionSource = 'website',
  userData = {},
  customData = {},
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) {
    console.warn('[capi] META_PIXEL_ID/META_CAPI_TOKEN ausentes — evento ignorado:', eventName);
    return { ok: false, skipped: true };
  }

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: actionSource,
        event_id: eventId,
        ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
        user_data: userData,
        custom_data: customData,
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  };

  try {
    const r = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    );
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('[capi] erro', eventName, r.status, JSON.stringify(json));
      return { ok: false, status: r.status, json };
    }
    return { ok: true, json };
  } catch (err) {
    console.error('[capi] fetch falhou', eventName, err);
    return { ok: false, error: String(err) };
  }
}
