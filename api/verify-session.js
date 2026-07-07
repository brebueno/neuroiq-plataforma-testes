import Stripe from 'stripe';

// Tamper-proof unlock: the frontend calls this on return from Checkout with the
// session_id. We ask STRIPE directly whether that session actually completed —
// so a user can't just type ?paid=1 to unlock. No database needed for this
// immediate check (the webhook handles ongoing subscription state).

export default async function handler(req, res) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ paid: false, error: 'Stripe não configurado.' });
    return;
  }

  const sessionId = req.query?.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ paid: false, error: 'session_id ausente.' });
    return;
  }

  const stripe = new Stripe(secret);
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    // 'complete' covers paid sessions AND subscriptions that started on a trial
    // (payment_status = 'no_payment_required'). Both mean access is granted.
    const paid = s.status === 'complete' || s.payment_status === 'paid';
    res.status(200).json({
      paid: Boolean(paid),
      status: s.status,
      paymentStatus: s.payment_status,
    });
  } catch (err) {
    res.status(500).json({ paid: false, error: err instanceof Error ? err.message : 'Erro' });
  }
}
