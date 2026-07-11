import { useEffect, useState } from 'react';
import { Brain, Check, Lock, Zap } from 'lucide-react';
import { PROOF } from '../utils/socialProof';
import { TrustBar } from './SocialProof';

// Conversion hinge for the non-numeric tests (personality / career). Mirrors the
// IQ RevealSequence: an "analyzing" build-up, a micro-commitment, then a
// curiosity + social-proof + loss-framing tease before the paywall.
interface PsychRevealProps {
  analyzing: string[];
  commitQuestion: string;
  commitOptions: [string, string];
  teaseHeadline: string;
  teaseSub: string;
  lockedLabel: string;
  provocation: string;
  onUnlock: () => void;
  onBack: () => void;
}

type Phase = 'analyzing' | 'commit' | 'reveal';

export default function PsychReveal({
  analyzing, commitQuestion, commitOptions, teaseHeadline, teaseSub, lockedLabel, provocation, onUnlock, onBack,
}: PsychRevealProps) {
  const [phase, setPhase] = useState<Phase>('analyzing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const started = Date.now();
    const id = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / 2600) * 100);
      setProgress(pct);
      if (pct >= 100) { window.clearInterval(id); setPhase('commit'); }
    }, 40);
    return () => window.clearInterval(id);
  }, [phase]);

  const shell = 'min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4';

  if (phase === 'analyzing') {
    return (
      <div className={shell}>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <Brain className="w-12 h-12 text-brand mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-extrabold text-ink mb-2">Analisando suas respostas…</h2>
          <p className="text-slate-500 text-sm mb-6">Cruzando seus padrões com milhares de perfis.</p>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
            <div className="bg-brand h-2 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <ul className="text-left space-y-3">
            {analyzing.map((step, i) => {
              const done = progress >= ((i + 1) / analyzing.length) * 100;
              return (
                <li key={step} className="flex items-center gap-3 text-sm">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'bg-brand' : 'bg-slate-200'}`}>
                    {done && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className={done ? 'text-ink font-medium' : 'text-slate-400'}>{step}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  if (phase === 'commit') {
    return (
      <div className={shell}>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center gap-2 bg-brand-light text-brand-dark px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Check className="w-4 h-4" />
            Análise concluída
          </div>
          <h2 className="text-2xl font-extrabold text-ink mb-8">{commitQuestion}</h2>
          <div className="grid grid-cols-2 gap-3">
            {commitOptions.map((label) => (
              <button
                key={label}
                onClick={() => setPhase('reveal')}
                className="py-4 px-4 rounded-xl border border-slate-200 hover:border-brand hover:bg-brand-light transition-colors font-semibold text-ink"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 bg-brand-light text-brand-dark px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
          <Check className="w-4 h-4" />
          Seu resultado está pronto
        </div>

        <h2 className="text-2xl font-extrabold text-ink mb-1 text-balance">{teaseHeadline}</h2>
        <p className="text-slate-500 text-sm mb-6">{teaseSub}</p>

        {/* Curiosity gap — the result exists but is locked */}
        <div className="relative bg-brand-light rounded-xl p-6 mb-5 overflow-hidden">
          <div className="select-none blur-md">
            <div className="text-xs text-brand mb-1 uppercase tracking-wide">{lockedLabel}</div>
            <span className="text-3xl font-extrabold text-ink">••••••••</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-7 h-7 text-brand" />
          </div>
        </div>

        {/* Prova social */}
        <div className="flex items-center justify-center gap-2 mb-4 text-xs text-slate-500">
          <span className="flex -space-x-1.5">
            {['#12A08C', '#2F6BEB', '#E0A11C'].map((c) => (
              <span key={c} className="w-5 h-5 rounded-full border-2 border-white" style={{ background: c }} />
            ))}
          </span>
          <span><span className="font-semibold text-ink">{PROOF.today}</span> pessoas fizeram este teste só hoje</span>
        </div>

        {/* Provocação + loss-framing */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
          <p className="text-[13px] text-amber-900">{provocation}</p>
        </div>

        <button
          onClick={onUnlock}
          className="w-full bg-brand text-white py-4 px-4 rounded-xl hover:bg-brand-dark transition-colors font-semibold text-lg shadow-[0_10px_26px_-8px_rgba(18,160,140,0.6)] flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Desbloquear meu resultado
        </button>
        <TrustBar className="mt-3" />
        <button onClick={onBack} className="mt-4 text-slate-400 hover:text-slate-600 text-sm">
          Agora não, descartar meu resultado
        </button>
      </div>
    </div>
  );
}
