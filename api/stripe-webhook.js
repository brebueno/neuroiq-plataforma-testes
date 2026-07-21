import Stripe from 'stripe';
import { sendMetaEvent, buildUserData } from './_capi.js';
import { setSubscriptionByCustomer } from './_supabase.js';

// Stripe webhook, keeps subscription state in sync over time (renewals,
// cancellations, failed payments). Stripe requires the RAW request body to
// verify the signature, so body parsing is disabled here.
//
// Setup:
//   1. Deploy, then in Stripe dashboard → Developers → Webhooks → add endpoint:
//        https://SEU-DOMINIO/api/stripe-webhook
//      Events: checkout.session.completed, customer.subscription.updated,
//              customer.subscription.deleted, invoice.payment_failed
//   2. Copy the endpoint's "Signing secret" (whsec_...) into the Vercel env var
//      STRIPE_WEBHOOK_SECRET, then redeploy.

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// ---- Entitlement persistence -------------------------------------------------
// TODO (Fase 1): persist access in a real store (Vercel KV / Upstash Redis /
// Supabase). Keyed by Stripe customer id (and/or email). `verify-session`
// handles the immediate unlock; these keep it correct as subscriptions change.
// Sincroniza a assinatura em `profiles` (Supabase) pelo stripe_customer_id.
// O profile é criado no signup (trigger handle_new_user) e ganha o
// stripe_customer_id no complete-signup pós-pagamento; aqui só ATUALIZAMOS o
// status. Se nenhum profile bater (usuário ainda não criou conta), afeta 0
// linhas, sem erro — o acesso imediato já veio do verify-session.
async function grantAccess(customerId, subscriptionId, status, endsAt) {
  const normalized = status === 'checkout_completed' ? 'trialing' : status;
  const n = await setSubscriptionByCustomer(customerId, { status: normalized, endsAt });
  console.log('[webhook] grant access', { customerId, subscriptionId, status: normalized, profilesUpdated: n });
}

async function revokeAccess(customerId, reason) {
  const n = await setSubscriptionByCustomer(customerId, { status: 'canceled' });
  console.log('[webhook] revoke access', { customerId, reason, profilesUpdated: n });
}
// -----------------------------------------------------------------------------

// ---- Conversions API (fonte de verdade das conversões) ----------------------
// Purchase = entrada paga (checkout concluído). event_id = id da sessão, pra
// deduplicar com o Purchase do browser (PaymentReturn usa o mesmo id).
async function firePurchase(s) {
  try {
    const md = s.metadata || {};
    const email = (s.customer_details && s.customer_details.email) || s.customer_email || undefined;
    await sendMetaEvent({
      eventName: 'Purchase',
      eventId: s.id,
      eventSourceUrl: md.event_source_url,
      actionSource: 'website',
      userData: buildUserData({ email, phone: md.phone, fbp: md.fbp, fbc: md.fbc }),
      customData: {
        value: (s.amount_total ?? 0) / 100,
        currency: (s.currency || 'brl').toUpperCase(),
        content_name: 'assinatura_qimind',
      },
    });
  } catch (err) {
    console.error('[webhook] firePurchase', err);
  }
}

// Subscribe = RENOVAÇÃO do ciclo (ex: R$159 após o trial). O sinal de alto valor
// e "pagador real" — ideal pra otimização por valor mais pra frente.
async function fireRenewal(inv) {
  try {
    const md = (inv.subscription_details && inv.subscription_details.metadata) || {};
    await sendMetaEvent({
      eventName: 'Subscribe',
      eventId: inv.id,
      actionSource: 'website',
      userData: buildUserData({ email: inv.customer_email || undefined, phone: md.phone, fbp: md.fbp, fbc: md.fbc }),
      customData: {
        value: (inv.amount_paid ?? 0) / 100,
        currency: (inv.currency || 'brl').toUpperCase(),
        content_name: 'assinatura_qimind_renovacao',
      },
    });
  } catch (err) {
    console.error('[webhook] fireRenewal', err);
  }
}
// -----------------------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    res.status(500).json({ error: 'Stripe webhook não configurado (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET).' });
    return;
  }

  const stripe = new Stripe(secret, { httpClient: Stripe.createFetchHttpClient() });
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    // Signature failed → reject. This is what makes the webhook trustworthy.
    res.status(400).json({ error: `Assinatura inválida: ${err instanceof Error ? err.message : 'erro'}` });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        await grantAccess(s.customer, s.subscription, 'checkout_completed');
        await firePurchase(s); // Purchase server-side (dedup por event_id = s.id)
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const active = sub.status === 'active' || sub.status === 'trialing';
        const endsAt = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined;
        if (active) await grantAccess(sub.customer, sub.id, sub.status, endsAt);
        else await revokeAccess(sub.customer, `status:${sub.status}`);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await revokeAccess(sub.customer, 'subscription_deleted');
        break;
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object;
        await revokeAccess(inv.customer, 'payment_failed');
        break;
      }
      case 'invoice.payment_succeeded': {
        const inv = event.data.object;
        // Só a RENOVAÇÃO (novo ciclo). A entrada já virou Purchase no
        // checkout.session.completed — aqui entra o valor cheio (ex: R$159).
        if (inv.billing_reason === 'subscription_cycle') await fireRenewal(inv);
        break;
      }
      default:
        // ignore other event types
        break;
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] handler error', err);
    res.status(500).json({ error: 'Erro ao processar evento.' });
  }
}
