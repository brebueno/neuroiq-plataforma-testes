# NeuroIQ — Go-Live (deploy Vercel + tráfego)

Estado: auditoria de segurança feita (AgentShield + review estático + pentest dinâmico), correções de código aplicadas, build de produção OK. Falta **config** (só você faz) + rodar 1 SQL.

## 🔴 Bloqueadores — fazer ANTES de subir tráfego

1. **Rodar o SQL de DB** — `supabase-security-fix.sql` no Supabase → SQL Editor.
   Fecha a auto-escalação de assinatura (usuário se dar `active` de graça pelo browser). Depois, crie 1 conta de teste e confirme que o profile é criado.

2. **Env vars na Vercel (valores de PRODUÇÃO / LIVE):**
   | Var | Valor |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_live_…` (**ROTACIONE** a que vazou no chat) |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
   | `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_TRIAL` | price IDs **live** (os de teste não funcionam com chave live) |
   | `STRIPE_TRIAL_DAYS` | `7` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` do endpoint **live** (passo 3) |
   | `PUBLIC_APP_URL` | `https://neuroiq.pro` (obrigatório — sem isso o return_url cai no header) |
   | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | do projeto |
   | `SUPABASE_SERVICE_ROLE_KEY` | do projeto (backend only) |
   | `META_PIXEL_ID` | `1037768161943603` |
   | `META_CAPI_TOKEN` | token live da Conversions API |
   | `META_TEST_EVENT_CODE` | **NÃO setar em produção** (senão os eventos vão pro bucket de teste e não otimizam campanha) |

3. **Webhook Stripe LIVE** → Developers → Webhooks → add endpoint
   `https://neuroiq.pro/api/stripe-webhook`
   Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`.
   Copie o *Signing secret* → `STRIPE_WEBHOOK_SECRET`.

4. **Rotacionar** a `sk_live` exposta no chat (Stripe → API keys → Roll).

## ✅ Já corrigido (código)

- **C1 (crítico):** `complete-signup` agora usa o email **da sessão Stripe** (não do body) + idempotência por `stripe_customer_id` → acabou o "1 pagamento vira N contas" e o sequestro de conta.
- **H1:** `verify-session` **não retorna mais email** (PII) + erro genérico (sem oráculo de enumeração).
- **H2:** `track.js` só repassa `Purchase` se a Stripe confirmar o pagamento, com o **valor da Stripe** (não do cliente) + allowlist de eventos → acabou o flood de conversão falsa que envenena campanha.
- **H3:** rate limit por IP em checkout / track / verify-session / complete-signup.
- **CSP:** `connect-src` liberado pra Supabase (estava bloqueado → auth/realtime morreriam em prod) e `script-src` pro Pixel; HSTS, X-Frame-Options DENY, etc.

## 📊 Tracking (retroalimentação de campanha)

Funil completo, com dedup por `event_id`:
`PageView` → `ViewContent` (início do teste) → `Lead` (email **+ telefone** = match alto) → `InitiateCheckout` → `Purchase` → `Subscribe` (renovação).

O **loop server-side** que alimenta a campanha: `stripe-webhook` (fonte de verdade) → Conversions API dispara `Purchase` + `Subscribe` com `em+ph+fbp+fbc` (EMQ enriquecido), `event_id = session/invoice id` → dedup com o Pixel do browser → a Meta otimiza pelos **pagantes reais**. Sobrevive a ad-blocker/iOS.

Validar pós-deploy: uma compra real → ver `Purchase` no Events Manager (aba principal, não "Testar eventos") + `profiles.subscription_status` ativo.

## Deploy

```bash
# do diretório do projeto, com os env vars já setados na Vercel:
vercel --prod          # ou: git push (se o projeto está ligado ao repo na Vercel)
```

## Hardening pós-launch (não bloqueia)

- Rate limit atual é best-effort por instância (serverless). Pra escala/ataque distribuído: **Upstash Ratelimit** ou **Vercel Firewall**.
- CSP ainda usa `'unsafe-inline'` em `script-src` (o Pixel inline exige). Migrar pra nonce quando houver SSR/middleware.
- Bundle 589KB → code-split (`dynamic import`) pra melhorar LCP.
- `esbuild` (dev-only) tem CVE de dev server — atualizar Vite quando conveniente (breaking).
