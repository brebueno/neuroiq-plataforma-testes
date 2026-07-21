// Rate limit best-effort. Em serverless o Map é POR INSTÂNCIA (lambda quente),
// não global — segura flood trivial/bot single-source e abuso de custo, mas NÃO
// um ataque distribuído. Pra proteção robusta em produção: Upstash Ratelimit
// (Vercel KV) ou Vercel Firewall. Zero-dep de propósito pra não travar o deploy.
const buckets = new Map();
const MAX_KEYS = 5000; // teto de memória (evita crescer sem limite)

export function rateLimit(key, { limit = 30, windowMs = 60000 } = {}) {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) buckets.clear(); // reset bruto se estourar
  const e = buckets.get(key);
  if (!e || now > e.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  e.count += 1;
  if (e.count > limit) return { ok: false, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  return { ok: true };
}

export function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}
