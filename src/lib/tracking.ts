// Tracking client-side do QIMind (arquitetura direct-in-code).
//
// O que este módulo faz:
//  1. Captura fbclid/gclid/gbraid/wbraid + UTMs no acesso e PERSISTE em
//     localStorage por 90 dias. A janela de cookie do Safari (ITP) é de ~7 dias
//     e o trial dura 7 — sem isso a atribuição do pagamento se perde.
//  2. Dispara cada evento no Pixel (browser) E manda uma cópia pro servidor
//     (/api/track), que reenvia via Conversions API com o MESMO event_id.
//     event_id igual em browser+server => a Meta deduplica (conta 1).
//  3. Coleta fbp/fbc (não hasheados) pra elevar o Event Match Quality.
//
// Nunca lança erro pra fora: tracking não pode quebrar o funil.

type UserData = { email?: string; phone?: string; externalId?: string };
type CustomData = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const STORE_KEY = 'qm_attribution';
const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

interface Attribution {
  fbclid?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbc?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ts?: number;
}

function readStore(): Attribution {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Attribution;
    if (data.ts && Date.now() - data.ts > NINETY_DAYS) return {};
    return data;
  } catch {
    return {};
  }
}

function writeStore(a: Attribution) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...a, ts: Date.now() }));
  } catch {
    /* localStorage indisponível (modo privado) — segue sem persistir */
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m.pop() as string) : undefined;
}

// Roda 1x no load (via initTracking em main.tsx). First-touch é preservado, mas
// um novo clique de anúncio (novo fbclid/gclid) atualiza os identificadores.
export function initTracking(): void {
  if (typeof window === 'undefined') return;
  const q = new URL(window.location.href).searchParams;
  const next: Attribution = { ...readStore() };

  const fbclid = q.get('fbclid');
  if (fbclid) {
    next.fbclid = fbclid;
    // fbc precisa do formato exato: fb.1.<timestamp>.<fbclid>
    next.fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  (['gclid', 'gbraid', 'wbraid'] as const).forEach((k) => {
    const v = q.get(k);
    if (v) next[k] = v;
  });
  (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const).forEach((k) => {
    const v = q.get(k);
    if (v) next[k] = v;
  });
  writeStore(next);
}

// Prefere o cookie do próprio Pixel (_fbp/_fbc); cai pro fbc que construímos do
// fbclid quando o cookie ainda não existe.
function currentIdentifiers() {
  const store = readStore();
  return {
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc') || store.fbc,
    store,
  };
}

function newEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Dispara um evento no Pixel (browser) + no servidor (CAPI) com o MESMO
// event_id (dedup). Passe `opts.eventId` quando precisar de um id determinístico
// (ex: Purchase usando o id da sessão do Stripe, pra bater com o webhook).
export function track(
  eventName: string,
  customData: CustomData = {},
  userData: UserData = {},
  opts: { eventId?: string } = {},
): string {
  const eventId = opts.eventId || newEventId();
  if (typeof window === 'undefined') return eventId;

  const { fbp, fbc, store } = currentIdentifiers();

  // 1) Browser (Pixel)
  try {
    window.fbq?.('track', eventName, customData, { eventID: eventId });
  } catch {
    /* pixel bloqueado — a CAPI cobre */
  }

  // 2) Servidor (CAPI). keepalive garante o envio mesmo em navegação/unmount.
  try {
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        customData,
        userData,
        fbp,
        fbc,
        attribution: store,
      }),
    });
  } catch {
    /* offline/erro de rede — ignora */
  }

  return eventId;
}

// Snapshot da atribuição pra mandar ao create-checkout-session. O webhook usa
// isso pra disparar o Purchase server-side com o mesmo match (email + fbp/fbc).
export function attributionSnapshot() {
  const { fbp, fbc, store } = currentIdentifiers();
  return {
    fbp,
    fbc,
    fbclid: store.fbclid,
    gclid: store.gclid,
    gbraid: store.gbraid,
    wbraid: store.wbraid,
    utm_source: store.utm_source,
    utm_medium: store.utm_medium,
    utm_campaign: store.utm_campaign,
    utm_term: store.utm_term,
    utm_content: store.utm_content,
    event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
}

// ---- Helpers semânticos do funil -------------------------------------------
export const trackTestStart = (testName: string): string =>
  track('ViewContent', { content_name: testName, content_category: 'test' });

export const trackLead = (email: string): string =>
  track('Lead', { content_name: 'email_gate' }, { email });

export const trackInitiateCheckout = (email?: string): string =>
  track('InitiateCheckout', { content_name: 'checkout_qimind', currency: 'BRL' }, email ? { email } : {});
