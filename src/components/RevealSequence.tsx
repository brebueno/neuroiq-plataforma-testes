import { useEffect, useMemo, useState } from 'react';
import { Brain, Lock, Check, Zap } from 'lucide-react';

// The reveal is the conversion hinge: intent to pay is highest here. It never
// shows the score. It makes the user FEEL close to it, flatters the ego, then
// locks it. Copy tuned for a normal audience: "you're smarter than you think".

interface RevealSequenceProps {
  percentile: number;
  accuracyPct: number;
  avgSeconds: number;
  onUnlock: () => void;
  onBack: () => void;
}

const ANALYSIS_STEPS = ['Memória de trabalho', 'Raciocínio lógico', 'Velocidade de processamento', 'Reconhecimento de padrões'];

// PROVA SOCIAL — troque pelos números REAIS quando tiver (contador real no backend).
// Número fabricado é o gatilho de chargeback/ban/FTC — sua conta, sua decisão.
const SOCIAL = { hoje: '3.100+', total: '180 mil+' };

// Pop-culture IQ figures. The number is hidden until purchase, so the anchors
// set an aspirational frame ("onde eu me encaixo?").
const LOWER = [{ name: 'Charles Darwin', iq: 135 }, { name: 'Garry Kasparov', iq: 135 }];
const UPPER = [{ name: 'Albert Einstein', iq: 160 }, { name: 'Stephen Hawking', iq: 160 }];

type Phase = 'analyzing' | 'commit' | 'reveal';

export default function RevealSequence({ percentile, accuracyPct, avgSeconds, onUnlock, onBack }: RevealSequenceProps) {
  const [phase, setPhase] = useState<Phase>('analyzing');
  const [progress, setProgress] = useState(0);

  const lower = useMemo(() => LOWER[Math.floor(Math.random() * LOWER.length)], []);
  const upper = useMemo(() => UPPER[Math.floor(Math.random() * UPPER.length)], []);
  const fasterThan = Math.max(35, Math.min(96, Math.round(100 - avgSeconds * 3)));

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const started = Date.now();
    const id = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / 2600) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        setPhase('commit');
      }
    }, 40);
    return () => window.clearInterval(id);
  }, [phase]);

  const shell = 'min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4';

  // ---------- PHASE 1: analyzing ----------
  if (phase === 'analyzing') {
    return (
      <div className={shell}>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <Brain className="w-12 h-12 text-brand mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-extrabold text-ink mb-2">Analisando suas respostas…</h2>
          <p className="text-slate-500 text-sm mb-6">Estamos cruzando velocidade, precisão e seus padrões de raciocínio.</p>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
            <div className="bg-brand h-2 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <ul className="text-left space-y-3">
            {ANALYSIS_STEPS.map((step, i) => {
              const done = progress >= ((i + 1) / ANALYSIS_STEPS.length) * 100;
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

  // ---------- PHASE 2: micro-commitment ----------
  if (phase === 'commit') {
    return (
      <div className={shell}>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center gap-2 bg-brand-light text-brand-dark px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Check className="w-4 h-4" />
            Análise concluída
          </div>
          <h2 className="text-2xl font-extrabold text-ink mb-8">
            Antes de revelar: você acha que seu QI está <span className="text-brand">acima da média</span>?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {['Com certeza', 'Não sei dizer'].map((label) => (
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

  // ---------- PHASE 3: reveal + genius anchoring ----------
  return (
    <div className={shell}>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 bg-brand-light text-brand-dark px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
          <Check className="w-4 h-4" />
          Seu resultado está pronto
        </div>

        <h2 className="text-2xl font-extrabold text-ink mb-1 text-balance">
          E ele é mais alto do que você imaginava.
        </h2>
        <p className="text-slate-500 text-sm mb-6">Sua pontuação já foi calculada. Falta um clique pra você ver.</p>

        {/* Percentile flattery — no score revealed */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-2xl font-extrabold text-ink">{accuracyPct}%</div>
            <div className="text-xs text-slate-500 mt-1">de precisão</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-2xl font-extrabold text-ink">{fasterThan}%</div>
            <div className="text-xs text-slate-500 mt-1">mais rápido que as pessoas</div>
          </div>
        </div>

        {/* Genius anchoring — YOU hidden between two famous minds */}
        <p className="text-sm text-slate-500 mb-3">Pra você ter uma ideia de onde caiu:</p>
        <div className="grid grid-cols-3 gap-2 mb-5 items-end">
          <AnchorCard name={lower.name} value={String(lower.iq)} />
          <div className="bg-gradient-to-b from-amber-50 to-brand-light rounded-xl p-3 border border-amber-400 relative">
            <div className="text-[11px] text-amber-600 font-semibold mb-1">VOCÊ</div>
            <div className="relative flex items-center justify-center">
              <span className="text-2xl font-extrabold text-amber-500 blur-md select-none">1??</span>
              <Lock className="w-4 h-4 text-amber-500 absolute" />
            </div>
          </div>
          <AnchorCard name={upper.name} value={String(upper.iq)} />
        </div>

        <p className="text-slate-600 text-sm mb-4">
          Você pontuou melhor que <span className="font-semibold text-ink">{percentile}%</span> das pessoas.
        </p>

        {/* Prova social */}
        <div className="flex items-center justify-center gap-2 mb-4 text-xs text-slate-500">
          <span className="flex -space-x-1.5">
            {['#12A08C', '#2F6BEB', '#E0A11C'].map((c) => (
              <span key={c} className="w-5 h-5 rounded-full border-2 border-white" style={{ background: c }} />
            ))}
          </span>
          <span><span className="font-semibold text-ink">{SOCIAL.hoje}</span> pessoas descobriram o QI só hoje</span>
        </div>

        {/* Provocação + loss-framing */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
          <p className="text-[13px] text-amber-900">
            Seu número já existe — está calculado e guardado. A única pergunta é se <strong>você</strong> vai vê-lo, ou vai passar a vida se perguntando.
          </p>
        </div>

        <button
          onClick={onUnlock}
          className="w-full bg-brand text-white py-4 px-4 rounded-xl hover:bg-brand-dark transition-colors font-semibold text-lg shadow-[0_10px_26px_-8px_rgba(18,160,140,0.6)] flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Desbloquear meu QI
        </button>
        <button onClick={onBack} className="mt-3 text-slate-400 hover:text-slate-600 text-sm">
          Agora não, descartar meu resultado
        </button>
      </div>
    </div>
  );
}

function AnchorCard({ name, value }: { name: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="text-2xl font-extrabold text-slate-400">{value}</div>
      <div className="text-[11px] text-slate-500 mt-1 leading-tight">{name}</div>
    </div>
  );
}
