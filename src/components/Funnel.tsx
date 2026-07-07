import { useState } from 'react';
import { Lock, Check, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';

interface FunnelProps {
  headline?: string;
  lockedLabel: string; // e.g. "QI", "Seu perfil", "Seu código vocacional"
  lockedValue: string; // the blurred value, e.g. "123", "Extroversão", "RIA"
  bullets: string[]; // what the user unlocks
  onUnlock: () => void;
  onBack: () => void;
  initialStage?: Stage; // start at 'paywall' when a richer reveal already played the tease
}

/**
 * OFFER CONFIG — edit these to change your pricing.
 * The renewal terms MUST be shown clearly before payment (they are, below).
 * This keeps chargebacks low and payment processors happy.
 */
const OFFER = {
  currency: 'R$',
  trialPrice: '9,90',
  trialDays: 7,
  renewalPrice: '159,90',
  renewalPeriod: 'mês',
};

/**
 * Calls the serverless endpoint to create a real Stripe Checkout Session and
 * returns the hosted checkout URL. Returns null if Stripe isn't configured yet
 * (e.g. local `npm run dev` without `vercel dev`), so we can fall back to demo.
 * The Stripe SECRET key lives only on the backend — never in this file.
 */
async function startCheckout(email: string): Promise<string | null> {
  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.url ?? null;
  } catch {
    return null;
  }
}

type Stage = 'tease' | 'paywall' | 'processing';

export default function Funnel({ headline, lockedLabel, lockedValue, bullets, onUnlock, onBack, initialStage = 'tease' }: FunnelProps) {
  const [stage, setStage] = useState<Stage>(initialStage);
  const [email, setEmail] = useState('');

  // ---------- TEASE: result is ready, but locked ----------
  if (stage === 'tease') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Check className="w-4 h-4" />
            {headline || 'Teste concluído — seu resultado está pronto!'}
          </div>

          {/* Blurred value — the curiosity gap */}
          <div className="relative bg-brand-light rounded-xl p-8 mb-6 overflow-hidden">
            <div className="select-none blur-md">
              <div className="text-sm text-brand mb-1">{lockedLabel}</div>
              <span className="text-4xl font-extrabold text-ink">{lockedValue}</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-8 h-8 text-brand" />
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Seu relatório completo está pronto. Desbloqueie para ver tudo:
          </p>

          <ul className="text-left text-sm text-gray-700 space-y-2 mb-6">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setStage('paywall')}
            className="w-full bg-brand text-white py-4 px-4 rounded-xl hover:bg-brand-dark transition-colors font-semibold text-lg shadow-lg"
          >
            Desbloquear meu resultado →
          </button>
          <button onClick={onBack} className="mt-3 text-gray-400 hover:text-gray-600 text-sm">
            Não, obrigado — descartar resultado
          </button>
        </div>
      </div>
    );
  }

  // ---------- PAYWALL: offer + checkout ----------
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage('processing');
    const url = await startCheckout(email);
    if (url) {
      window.location.href = url; // → Stripe hosted checkout
    } else {
      // Stripe not wired locally → demo unlock so the flow still works.
      onUnlock();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Desbloqueie seu resultado</h2>
        <p className="text-gray-500 text-center text-sm mb-6">A um passo do seu relatório completo</p>

        <div className="border-2 border-brand rounded-xl p-5 mb-5 bg-brand-light/50">
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-lg text-gray-600">{OFFER.currency}</span>
            <span className="text-4xl font-extrabold text-gray-900">{OFFER.trialPrice}</span>
            <span className="text-gray-600">/ {OFFER.trialDays} dias</span>
          </div>
          <p className="text-center text-sm text-gray-600">Acesso completo + todos os testes e treinos</p>
        </div>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Teste de {OFFER.trialDays} dias por {OFFER.currency}
            {OFFER.trialPrice}. Depois, renova automaticamente por{' '}
            <strong>
              {OFFER.currency}
              {OFFER.renewalPrice}/{OFFER.renewalPeriod}
            </strong>
            . <strong>Cancele quando quiser</strong>, em 1 clique.
          </span>
        </div>

        <form onSubmit={handlePay} className="space-y-3">
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={stage === 'processing'}
            className="w-full bg-green-600 text-white py-4 px-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {stage === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecionando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Ir para o pagamento seguro
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          Cartão processado com segurança pela Stripe
        </div>
      </div>
    </div>
  );
}
