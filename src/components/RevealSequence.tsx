import { useEffect, useMemo, useState } from 'react';
import { Brain, Lock, Check, Zap } from 'lucide-react';

// The reveal is the conversion hinge: the moment intent to pay is highest.
// It doesn't show the score — it makes the user FEEL close to it, then locks it.
// Three ego levers: a cinematic "analyzing" build-up, percentile flattery, and
// genius anchoring (your hidden number sitting between two famous minds).

interface RevealSequenceProps {
  percentile: number;
  accuracyPct: number;
  avgSeconds: number;
  onUnlock: () => void;
  onBack: () => void;
}

const ANALYSIS_STEPS = [
  'Memória de trabalho',
  'Raciocínio lógico',
  'Velocidade de processamento',
  'Reconhecimento de padrões',
];

// Pop-culture IQ figures — the number is hidden until purchase, so the anchors
// set an aspirational frame ("onde eu me encaixo?").
const LOWER = [
  { name: 'Coco Chanel', iq: 113 },
  { name: 'Charles Darwin', iq: 135 },
  { name: 'Garry Kasparov', iq: 135 },
];
const UPPER = [
  { name: 'Albert Einstein', iq: 160 },
  { name: 'Stephen Hawking', iq: 160 },
  { name: 'Steve Jobs', iq: 160 },
];

type Phase = 'analyzing' | 'commit' | 'reveal';

export default function RevealSequence({ percentile, accuracyPct, avgSeconds, onUnlock, onBack }: RevealSequenceProps) {
  const [phase, setPhase] = useState<Phase>('analyzing');
  const [progress, setProgress] = useState(0);

  const lower = useMemo(() => LOWER[Math.floor(Math.random() * LOWER.length)], []);
  const upper = useMemo(() => UPPER[Math.floor(Math.random() * UPPER.length)], []);
  const fasterThan = Math.max(35, Math.min(96, Math.round(100 - avgSeconds * 3)));

  // Cinematic build-up: fill the bar, then ask the commitment question.
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

  const shell = 'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4';

  // ---------- PHASE 1: analyzing ----------
  if (phase === 'analyzing') {
    return (
      <div className={shell}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analisando suas respostas…</h2>
          <p className="text-gray-500 text-sm mb-6">Nossa análise cruza velocidade, precisão e padrões de raciocínio.</p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>

          <ul className="text-left space-y-3">
            {ANALYSIS_STEPS.map((step, i) => {
              const done = progress >= ((i + 1) / ANALYSIS_STEPS.length) * 100;
              return (
                <li key={step} className="flex items-center gap-3 text-sm">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      done ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    {done && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className={done ? 'text-gray-800 font-medium' : 'text-gray-400'}>{step}</span>
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
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Check className="w-4 h-4" />
            Análise concluída
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            Antes de revelar: você acha que seu QI está <span className="text-blue-600">acima da média</span>?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {['Com certeza', 'Não sei dizer'].map((label) => (
              <button
                key={label}
                onClick={() => setPhase('reveal')}
                className="py-4 px-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors font-semibold text-gray-700"
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
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
          <Check className="w-4 h-4" />
          Seu resultado está pronto
        </div>

        {/* Percentile flattery — no score revealed */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-extrabold text-gray-800">{accuracyPct}%</div>
            <div className="text-xs text-gray-500 mt-1">de precisão</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-extrabold text-gray-800">{fasterThan}%</div>
            <div className="text-xs text-gray-500 mt-1">mais rápido que as pessoas</div>
          </div>
        </div>

        {/* Genius anchoring — YOU hidden between two famous minds */}
        <p className="text-sm text-gray-500 mb-3">Onde você se encaixa?</p>
        <div className="grid grid-cols-3 gap-2 mb-6 items-end">
          <AnchorCard name={lower.name} value={String(lower.iq)} />
          <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl p-3 border-2 border-blue-500 relative">
            <div className="text-[11px] text-blue-600 font-semibold mb-1">VOCÊ</div>
            <div className="relative">
              <span className="text-2xl font-extrabold text-blue-800 blur-md select-none">1??</span>
              <Lock className="w-4 h-4 text-blue-500 absolute inset-0 m-auto" />
            </div>
          </div>
          <AnchorCard name={upper.name} value={String(upper.iq)} />
        </div>

        <p className="text-gray-600 text-sm mb-2">
          Você pontuou melhor que <span className="font-semibold text-gray-800">{percentile}%</span> das pessoas. Seu QI exato está a um clique.
        </p>

        <button
          onClick={onUnlock}
          className="w-full bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg flex items-center justify-center gap-2 mt-3"
        >
          <Zap className="w-5 h-5" />
          Desbloquear meu QI
        </button>
        <button onClick={onBack} className="mt-3 text-gray-400 hover:text-gray-600 text-sm">
          Não, obrigado — descartar resultado
        </button>
      </div>
    </div>
  );
}

function AnchorCard({ name, value }: { name: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-2xl font-extrabold text-gray-400">{value}</div>
      <div className="text-[11px] text-gray-500 mt-1 leading-tight">{name}</div>
    </div>
  );
}
