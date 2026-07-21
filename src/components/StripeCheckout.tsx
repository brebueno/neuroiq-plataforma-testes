import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { trackInitiateCheckout, attributionSnapshot } from '../lib/tracking';

// Inicialize o Stripe fora do componente para evitar recriações
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Props {
  email?: string;
  bump?: boolean; // order bump selecionado
  plan?: 'monthly' | 'annual'; // plano recorrente escolhido (upsell)
  onDemoUnlock: () => void; // fallback local
}

export default function StripeCheckout({ email, bump, plan, onDemoUnlock }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const icFired = useRef(false);

  useEffect(() => {
    // Recria a sessão quando bump/plano mudam (o valor cobrado muda).
    setClientSecret(null);
    setError(false);
    // InitiateCheckout uma vez só (não a cada troca de bump/plano).
    if (!icFired.current) {
      icFired.current = true;
      trackInitiateCheckout(email);
    }
    fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, bump, plan, attribution: attributionSnapshot() }),
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
  }, [email, bump, plan]);

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
        <p className="mb-2">Erro ao carregar o pagamento. Recarregue a página ou tente novamente em instantes.</p>
        {/* Fallback SÓ em desenvolvimento, senão libera acesso pago de graça em produção. */}
        {import.meta.env.DEV && (
          <button onClick={onDemoUnlock} className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg">
            [DEV] Usar fallback local
          </button>
        )}
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
      {/* key força o remount do checkout embutido quando o clientSecret muda (bump). */}
      <EmbeddedCheckoutProvider key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
