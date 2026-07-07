import Stripe from 'stripe';

// Vercel serverless function: cria uma Stripe Checkout Session (assinatura).
// A chave SECRETA nunca fica no frontend nem no repo — só aqui, via env var da
// Vercel (Settings → Environment Variables).
//
// MODELO "entrada paga": R$7 agora (7 dias) → R$159/mês depois.
//   - STRIPE_PRICE_TRIAL   -> preço AVULSO (one-time) de R$7,00 (cobrado no checkout)
//   - STRIPE_PRICE_MONTHLY -> preço RECORRENTE de R$159,00/mês
//   - STRIPE_TRIAL_DAYS    -> dias de trial no recorrente (default 7). Como há um
//                             item avulso, o R$7 é cobrado agora e o R$159 só no
//                             fim do trial.
// Env obrigatória: STRIPE_SECRET_KEY + STRIPE_PRICE_MONTHLY (trial é opcional).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceMonthly = process.env.STRIPE_PRICE_MONTHLY;
  const priceTrial = process.env.STRIPE_PRICE_TRIAL; // opcional (one-time R$7)
  if (!secret || !priceMonthly) {
    res.status(500).json({
      error: 'Stripe não configurado. Defina STRIPE_SECRET_KEY e STRIPE_PRICE_MONTHLY nas Environment Variables da Vercel.',
    });
    return;
  }

  const stripe = new Stripe(secret);
  const origin = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : '');
  const trialDays = Number(process.env.STRIPE_TRIAL_DAYS ?? 7);
  const email = req.body && typeof req.body === 'object' ? req.body.email : undefined;

  // Item recorrente sempre; item avulso (entrada de R$7) quando configurado.
  const lineItems = [{ price: priceMonthly, quantity: 1 }];
  if (priceTrial) lineItems.unshift({ price: priceTrial, quantity: 1 });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      // Trial no recorrente: o R$159 só é cobrado após `trialDays`. O item avulso
      // (R$7) entra na 1ª fatura e é cobrado agora, no checkout.
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
