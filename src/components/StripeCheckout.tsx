import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

// Checkout redirecionado (hospedado pela Stripe). Confiável e independente da
// versão da API da conta. Quando a conta sair da versão preview, dá pra trocar
// pelo Payment Element on-page reusando o mesmo endpoint.

interface Props {
  email?: string;
  onDemoUnlock: () => void; // fallback local (sem endpoint/Stripe)
}

export default function StripeCheckout({ email, onDemoUnlock }: Props) {
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      onDemoUnlock();
    } catch {
      onDemoUnlock();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={go}
      disabled={loading}
      className="w-full bg-green-600 text-white py-4 px-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" /> Redirecionando...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" /> Ir para o pagamento seguro
        </>
      )}
    </button>
  );
}
