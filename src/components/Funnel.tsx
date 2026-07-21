import { useState } from 'react';
import { Lock, Check, ShieldCheck } from 'lucide-react';
import StripeCheckout from './StripeCheckout';
import { LiveActivity, TrustBar } from './SocialProof';
import { PROOF } from '../utils/socialProof';
import { Lead } from './EmailGate';
import { Demographics } from './TestOnboarding';

interface FunnelProps {
  headline?: string;
  lockedLabel: string; // e.g. "QI", "Seu perfil", "Seu código vocacional"
  lockedValue: string; // the blurred value, e.g. "123", "Extroversão", "RIA"
  bullets: string[]; // what the user unlocks
  onUnlock: () => void;
  onBack: () => void;
  initialStage?: Stage; // start at 'paywall' when a richer reveal already played the tease
  email?: string; // captured before the reveal, prefills Stripe checkout
  lead?: Lead | null; // nome + telefone + email capturados no lead gate
  demographics?: Demographics | null; // gênero + faixa etária do onboarding
}

/**
 * OFFER CONFIG, edit these to change your pricing (must match the Stripe prices).
 * A renovação é mostrada CLARAMENTE antes do pagamento (evita chargeback).
 */
const OFFER = {
  currency: 'R$',
  trialPrice: '9,90',
  trialDays: 7,
  monthlyPrice: '159,00',
  annualPerMonth: '79,00', // plano anual (upsell): metade do mês a mês
  annualTotal: '948,00',
  annualSavePct: '50%',
  annualSaveValue: '960,00', // 159*12 - 948
  bumpPrice: '14,90', // order bump one-time (cobra STRIPE_PRICE_BUMP no checkout)
  bumpAnchor: '47,00',
};

type Stage = 'tease' | 'paywall';
type Plan = 'monthly' | 'annual';

export default function Funnel({ headline, lockedLabel, lockedValue, bullets, onUnlock, onBack, initialStage = 'tease', email, lead, demographics }: FunnelProps) {
  const [stage, setStage] = useState<Stage>(initialStage);
  const [bump, setBump] = useState(false);
  const [plan, setPlan] = useState<Plan>('annual'); // pré-seleciona o anual (upsell, maior LTV)

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

        {/* Entrada */}
        <div className="border-2 border-brand rounded-2xl p-5 mb-4 bg-brand-light/50 text-center">
          <div className="text-[11px] uppercase tracking-widest text-brand font-semibold mb-1">Comece hoje por</div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-lg text-gray-600">{OFFER.currency}</span>
            <span className="font-display text-5xl font-bold text-ink">{OFFER.trialPrice}</span>
            <span className="text-gray-600">/ {OFFER.trialDays} dias</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Acesso completo: todos os testes + a plataforma de treino</p>
        </div>

        {/* Escolha do plano (upsell: mensal vs anual, anual pré-selecionado) */}
        <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-2 mt-5">Depois do teste, seu plano</div>
        <div className="grid grid-cols-2 gap-2.5 mb-2">
          {(['annual', 'monthly'] as Plan[]).map((pl) => {
            const on = plan === pl;
            return (
              <button key={pl} type="button" onClick={() => setPlan(pl)} className={`relative rounded-2xl border-2 p-3 text-left transition-all ${on ? 'border-brand bg-brand-light/50 shadow-[0_10px_24px_-14px_rgba(18,160,140,0.7)]' : 'border-slate-200 bg-white hover:border-brand/40'}`}>
                {pl === 'annual' && <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white bg-brand px-2 py-0.5 rounded-full">MELHOR VALOR · -{OFFER.annualSavePct}</span>}
                <div className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-full border-2 grid place-items-center flex-shrink-0 ${on ? 'border-brand' : 'border-slate-300'}`}>{on && <span className="w-2 h-2 rounded-full bg-brand" />}</span>
                  <span className="font-bold text-ink text-sm">{pl === 'annual' ? 'Anual' : 'Mensal'}</span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-0.5"><span className="font-display text-xl font-bold text-ink">{OFFER.currency}{pl === 'annual' ? OFFER.annualPerMonth : OFFER.monthlyPrice}</span><span className="text-[11px] text-slate-500">/mês</span></div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{pl === 'annual' ? `${OFFER.currency}${OFFER.annualTotal}/ano` : 'cobrado mês a mês'}</div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] font-semibold mb-4 text-center h-4">{plan === 'annual' ? <span className="text-emerald-600">Você economiza {OFFER.currency}{OFFER.annualSaveValue}/ano.</span> : <span className="text-slate-400">Troque pro anual e pague metade.</span>}</p>

        {/* Renovação clara (anti-chargeback) */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Teste de {OFFER.trialDays} dias por {OFFER.currency}{OFFER.trialPrice}. Depois, renova automaticamente {plan === 'annual' ? <strong>por {OFFER.currency}{OFFER.annualTotal}/ano ({OFFER.currency}{OFFER.annualPerMonth}/mês)</strong> : <strong>por {OFFER.currency}{OFFER.monthlyPrice}/mês</strong>}. <strong>Cancele quando quiser</strong>, em 1 clique.</span>
        </div>

        {/* Garantia, reversão de risco no ponto de fricção */}
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 text-xs text-emerald-900">
          <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>
            <strong>Garantia de 5 dias.</strong> Acesso completo pra testar tudo, com 2 dias de sobra antes de qualquer renovação. Se achar que não valeu os {OFFER.currency}{OFFER.trialPrice}, devolvemos cada centavo, e você fica com o resultado. Sem formulário, sem perguntas.
          </span>
        </div>

        {/* Order bump irresistível (add-on de oferta única) */}
        <label className={`relative block rounded-2xl p-4 mb-4 cursor-pointer border-2 transition-all ${bump ? 'border-brand bg-brand-light/50 shadow-[0_10px_24px_-14px_rgba(18,160,140,0.7)]' : 'border-dashed border-brand/40 bg-amber-50/50'}`}>
          <span className="absolute -top-2.5 left-4 whitespace-nowrap text-[9px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full">🔥 SÓ NESTE CHECKOUT</span>
          <div className="flex gap-3">
            <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} className="mt-1 w-5 h-5 accent-brand flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-ink text-[15px]">Relatório Comparativo dos Gênios</div>
              <ul className="mt-1.5 space-y-1 text-[12px] text-slate-600">
                {['Onde você supera Einstein, Darwin e Curie', 'Seus 3 superpoderes cognitivos, explicados', 'Um plano de leitura pra afiar cada um'].map((it) => (
                  <li key={it} className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />{it}</li>
                ))}
              </ul>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-slate-400 line-through text-sm">{OFFER.currency}{OFFER.bumpAnchor}</span>
                <span className="font-display text-lg font-bold text-brand">+{OFFER.currency}{OFFER.bumpPrice}</span>
                <span className="text-[10px] text-slate-400">some depois deste checkout</span>
              </div>
            </div>
          </div>
        </label>

        {/* Stripe Elements, pagamento embutido, sem sair da página */}
        <StripeCheckout onDemoUnlock={onUnlock} email={email} bump={bump} plan={plan} lead={lead} demographics={demographics} />

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
