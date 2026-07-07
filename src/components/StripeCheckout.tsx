import { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

// Stripe Elements — Embedded Checkout. O pagamento acontece DENTRO da página
// (sem redirecionar). A chave publicável é pública por natureza (vai no bundle).
const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = pk ? loadStripe(pk) : null;

interface Props {
  email?: string;
  onDemoUnlock: () => void; // fallback local (sem chave publicável configurada)
}

export default function StripeCheckout({ email, onDemoUnlock }: Props) {
  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return data.clientSecret as string;
  }, [email]);

  // Sem chave publicável (ex.: local sem env) → botão de demo pra não travar o fluxo.
  if (!stripePromise) {
    return (
      <button
        onClick={onDemoUnlock}
        className="w-full bg-green-600 text-white py-4 px-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg"
      >
        Desbloquear (modo demo — Stripe não configurado localmente)
      </button>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
