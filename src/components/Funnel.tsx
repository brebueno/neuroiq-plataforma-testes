import { useState } from 'react';
import { Lock, Check, ShieldCheck } from 'lucide-react';
import StripeCheckout from './StripeCheckout';
import { LiveActivity, TrustBar } from './SocialProof';
import { PROOF } from '../utils/socialProof';

interface FunnelProps {
  headline?: string;
  lockedLabel: string; // e.g. "QI", "Seu perfil", "Seu código vocacional"
  lockedValue: string; // the blurred value, e.g. "123", "Extroversão", "RIA"
  bullets: string[]; // what the user unlocks
  onUnlock: () => void;
  onBack: () => void;
  initialStage?: Stage; // start at 'paywall' when a richer reveal already played the tease
  email?: string; // captured before the reveal, prefills Stripe checkout
}

/**
 * OFFER CONFIG, edit these to change your pricing (must match the Stripe prices).
 * A renovação é mostrada CLARAMENTE antes do pagamento (evita chargeback).
 */
const OFFER = {
  currency: 'R$',
  trialPrice: '9,90',
  trialDays: 7,
  renewalPrice: '159,00',
  renewalPeriod: 'mês',
  bumpPrice: '14,90', // order bump one-time (cobra STRIPE_PRICE_BUMP no checkout)
};

type Stage = 'tease' | 'paywall';

export default function Funnel({ headline, lockedLabel, lockedValue, bullets, onUnlock, onBack, initialStage = 'tease', email }: FunnelProps) {
  const [stage, setStage] = useState<Stage>(initialStage);
  const [bump, setBump] = useState(false);

  // ---------- TEASE: result is ready, but locked ----------
  if (stage === 'tease') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Check className="w-4 h-4" />
            {headline || 'Teste concluído, seu resultado está pronto!'}
          </div>

          {/* Blurred value, the curiosity gap */}
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
            Ver meu número real →
          </button>
          <button onClick={onBack} className="mt-3 text-gray-400 hover:text-gray-600 text-sm">
            Não, obrigado. Descartar resultado
          </button>
        </div>
        <LiveActivity />
      </div>
    );
  }

  // ---------- PAYWALL: offer + Stripe Elements (embedded checkout) ----------
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Seu número já está calculado.</h2>
        <p className="text-gray-500 text-center text-sm mb-4">Falta um passo pra você ver onde caiu.</p>
        <p className="text-center text-xs text-slate-500 mb-6"><span className="font-semibold text-ink">{PROOF.today}</span> pessoas desbloquearam o resultado só hoje</p>

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

        {/* Garantia, reversão de risco no ponto de fricção */}
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-5 text-xs text-emerald-900">
          <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>
            <strong>Garantia de 5 dias.</strong> Acesso completo pra testar tudo, com 2 dias de sobra antes de qualquer renovação. Se achar que não valeu os {OFFER.currency}{OFFER.trialPrice}, devolvemos cada centavo, e você fica com o resultado. Sem formulário, sem perguntas.
          </span>
        </div>

        {/* Order bump: add-on de oferta única, marcado antes do checkout */}
        <label className={`flex items-start gap-2.5 rounded-xl p-3 mb-4 text-xs cursor-pointer border-2 transition-colors ${bump ? 'border-brand bg-brand-light/60' : 'border-dashed border-slate-300 bg-slate-50'}`}>
          <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand flex-shrink-0" />
          <span className="text-slate-700 leading-snug">
            <strong className="text-ink">Sim, quero o Relatório Comparativo</strong> (+{OFFER.currency}{OFFER.bumpPrice}): seu perfil lado a lado com 12 mentes famosas + guia de interpretação avançada. <span className="text-brand font-semibold">Oferta única, some depois deste checkout.</span>
          </span>
        </label>

        {/* Stripe Elements, pagamento embutido, sem sair da página */}
        <StripeCheckout onDemoUnlock={onUnlock} email={email} bump={bump} />

        <button onClick={onBack} className="w-full mt-4 text-gray-400 hover:text-gray-600 text-sm">
          Agora não, voltar
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          Pagamento processado com segurança pela Stripe
        </div>

        <TrustBar className="mt-4 pt-4 border-t border-slate-100" />
      </div>
      <LiveActivity />
    </div>
  );
}
