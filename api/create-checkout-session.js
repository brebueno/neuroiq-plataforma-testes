import Stripe from 'stripe';

// Vercel serverless function: creates a Stripe Checkout Session (subscription).
// The SECRET key NEVER lives in the frontend or the repo — only here, read from
// Vercel's environment variables (Settings → Environment Variables).
//
// Required env vars on Vercel:
//   STRIPE_SECRET_KEY   -> your (rotated!) sk_live_... or rk_live_... key
//   STRIPE_PRICE_ID     -> the recurring Price id (e.g. price_...), R$159,90/mês
// Optional:
//   STRIPE_TRIAL_DAYS   -> free-trial length in days (default 7). See note below
//                          about charging the R$9,90 trial fee.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!secret || !priceId) {
    res.status(500).json({
      error: 'Stripe não configurado. Defina STRIPE_SECRET_KEY e STRIPE_PRICE_ID nas Environment Variables da Vercel.',
    });
    return;
  }

  const stripe = new Stripe(secret);
  const origin = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : '');
  const trialDays = Number(process.env.STRIPE_TRIAL_DAYS ?? 7);
  const email = req.body && typeof req.body === 'object' ? req.body.email : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // NOTE: this gives a FREE trial (R$0) for `trialDays`, then charges the
      // recurring price. To charge the R$9,90 trial fee upfront, drop the trial
      // and add a one-time line item, or model it as a discounted first invoice.
      subscription_data: trialDays > 0 ? { trial_period_days: trialDays } : undefined,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      success_url: `${origin}/?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao criar sessão' });
  }
}
