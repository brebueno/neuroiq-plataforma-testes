import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

// Inicialize o Stripe fora do componente para evitar recriações
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Props {
  email?: string;
  onDemoUnlock: () => void; // fallback local
}

export default function StripeCheckout({ email, onDemoUnlock }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      });
  }, [email]);

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
        <p className="mb-4">Erro ao carregar o pagamento. Tente novamente mais tarde.</p>
        <button
          onClick={onDemoUnlock}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Usar fallback local
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="text-gray-500 font-medium">Carregando pagamento seguro...</span>
      </div>
    );
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
