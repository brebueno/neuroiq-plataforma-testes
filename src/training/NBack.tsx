import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

// Single N-back (2 atrás) numa grade 3x3: memória de trabalho (Jaeggi et al.).
// Marque "Igual" quando a posição atual for igual à de 2 passos atrás.
// Score 0..100 pela acurácia (acertos + rejeições corretas).
interface Props {
  onDone: (score: number) => void;
  onExit: () => void;
}

const TRIALS = 24;
const N = 2;
const INTERVAL = 2600;

function buildSeq(): number[] {
  const s: number[] = [];
  for (let i = 0; i < TRIALS; i++) {
    if (i >= N && Math.random() < 0.32) {
      s.push(s[i - N]);
    } else {
      let c = Math.floor(Math.random() * 9);
      if (i >= N && c === s[i - N]) c = (c + 1) % 9;
      s.push(c);
    }
  }
  return s;
}

export default function NBack({ onDone, onExit }: Props) {
  const [phase, setPhase] = useState<'ready' | 'run'>('ready');
  const [step, setStep] = useState(-1);
  const [seq] = useState<number[]>(buildSeq);
  const [pulse, setPulse] = useState(false);
  const responded = useRef(false);
  const correct = useRef(0);
  const scorable = useRef(0);
  const doneRef = useRef(false);

  // Avança os trials.
  useEffect(() => {
    if (phase !== 'run') return;
    const id = window.setInterval(() => setStep((s) => s + 1), INTERVAL);
    return () => window.clearInterval(id);
  }, [phase]);

  // Ao mudar de trial, avalia o trial anterior.
  useEffect(() => {
    if (phase !== 'run' || step < 0) return;
    const prev = step - 1;
    if (prev >= N) {
      const matched = seq[prev] === seq[prev - N];
      if (responded.current === matched) correct.current += 1;
      scorable.current += 1;
    }
    responded.current = false;
    if (step >= TRIALS && !doneRef.current) {
      doneRef.current = true;
      const total = scorable.current || 1;
      onDone(Math.round((correct.current / total) * 100));
    }
  }, [step, phase, seq, onDone]);

  const active = phase === 'run' && step >= 0 && step < TRIALS ? seq[step] : -1;

  const respond = () => {
    if (phase !== 'run' || step < N || step >= TRIALS || responded.current) return;
    responded.current = true;
    setPulse(true);
    window.setTimeout(() => setPulse(false), 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6 text-sm">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600 flex items-center gap-1"><X className="w-4 h-4" /> Sair</button>
          <span className="font-mono text-slate-500">N-back (2 atrás)</span>
          <span className="font-mono text-slate-500">{phase === 'run' ? `${Math.min(step + 1, TRIALS)}/${TRIALS}` : ''}</span>
        </div>

        {phase === 'ready' ? (
          <div className="text-center py-4">
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-3">Memória de trabalho</div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Uma célula acende a cada 2,6s. Toque <b>Igual</b> quando a posição atual for a <b>mesma de 2 passos atrás</b>.
            </p>
            <button onClick={() => { setPhase('run'); setStep(0); }} className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors">
              Começar
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl transition-colors duration-150 ${i === active ? 'bg-brand' : 'bg-slate-100'}`} />
              ))}
            </div>
            <button
              onClick={respond}
              disabled={step < N}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${pulse ? 'bg-emerald-500 text-white' : 'bg-brand-light text-brand-dark hover:bg-brand hover:text-white'} disabled:opacity-40`}
            >
              Igual (2 atrás)
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">Não toque quando for diferente.</p>
          </>
        )}
      </div>
    </div>
  );
}
