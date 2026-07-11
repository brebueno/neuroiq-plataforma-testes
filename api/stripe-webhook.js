import Stripe from 'stripe';

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
async function grantAccess(customerId, subscriptionId, status) {
  console.log('[webhook] grant access', { customerId, subscriptionId, status });
  // await kv.set(`access:${customerId}`, { active: true, subscriptionId, status });
}

async function revokeAccess(customerId, reason) {
  console.log('[webhook] revoke access', { customerId, reason });
  // await kv.set(`access:${customerId}`, { active: false, reason });
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
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const active = sub.status === 'active' || sub.status === 'trialing';
        if (active) await grantAccess(sub.customer, sub.id, sub.status);
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
