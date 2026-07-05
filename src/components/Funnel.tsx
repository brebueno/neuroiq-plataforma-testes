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
  trialPrice: '5,00',
  trialDays: 7,
  renewalPrice: '179,99',
  renewalPeriod: 'mês',
};

/**
 * DEMO CHECKOUT.
 * To take real money, replace `fakePay()` with a call to YOUR backend that
 * creates a Stripe Checkout Session and redirects to it. The Stripe SECRET key
 * lives only on the backend — never in this frontend file.
 */
const fakePay = () => new Promise<void>((resolve) => setTimeout(resolve, 1800));

type Stage = 'tease' | 'paywall' | 'processing';

export default function Funnel({ headline, lockedLabel, lockedValue, bullets, onUnlock, onBack, initialStage = 'tease' }: FunnelProps) {
  const [stage, setStage] = useState<Stage>(initialStage);

  // ---------- TEASE: result is ready, but locked ----------
  if (stage === 'tease') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Check className="w-4 h-4" />
            {headline || 'Teste concluído — seu resultado está pronto!'}
          </div>

          {/* Blurred value — the curiosity gap */}
          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-6 overflow-hidden">
            <div className="select-none blur-md">
              <div className="text-sm text-blue-600 mb-1">{lockedLabel}</div>
              <span className="text-4xl font-extrabold text-blue-800">{lockedValue}</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-400" />
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
            className="w-full bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
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
    await fakePay(); // ← swap for real Stripe call
    onUnlock();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Desbloqueie seu resultado</h2>
        <p className="text-gray-500 text-center text-sm mb-6">A um passo do seu relatório completo</p>

        <div className="border-2 border-blue-500 rounded-xl p-5 mb-5 bg-blue-50/40">
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

        <div className="text-[11px] text-center text-gray-400 mb-3">
          ⚠️ Checkout de demonstração — conecte seu Stripe no back-end pra cobrar de verdade
        </div>
        <form onSubmit={handlePay} className="space-y-3">
          <input
            required
            placeholder="E-mail"
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              required
              placeholder="Número do cartão"
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="MM/AA"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              required
              placeholder="CVV"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={stage === 'processing'}
            className="w-full bg-green-600 text-white py-4 px-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {stage === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Pagar {OFFER.currency}
                {OFFER.trialPrice} e ver resultado
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          Pagamento seguro e criptografado
        </div>
      </div>
    </div>
  );
}
