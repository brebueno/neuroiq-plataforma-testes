import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';

// Cálculo mental adaptativo (Arthur Benjamin). Sessão de 60s. Sobe de nível
// conforme acerta. Score 0..100 pela quantidade de acertos.
interface Props {
  onDone: (score: number) => void;
  onExit: () => void;
}

const SESSION = 60;
const r = (n: number) => Math.floor(Math.random() * n);

function gen(level: number): { q: string; ans: number } {
  if (level < 2) {
    const a = r(20) + 2, b = r(20) + 2;
    return { q: `${a} + ${b}`, ans: a + b };
  }
  if (level < 4) {
    const a = r(50) + 10, b = r(40) + 5;
    return Math.random() < 0.5 ? { q: `${a} + ${b}`, ans: a + b } : { q: `${a + b} − ${b}`, ans: a };
  }
  const a = r(12) + 3, b = r(12) + 3;
  return { q: `${a} × ${b}`, ans: a * b };
}

export default function MentalMath({ onDone, onExit }: Props) {
  const [correct, setCorrect] = useState(0);
  const [left, setLeft] = useState(SESSION);
  const [problem, setProblem] = useState(() => gen(1));
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  const level = 1 + Math.floor(correct / 4);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (left === 0 && !doneRef.current) {
      doneRef.current = true;
      onDone(Math.min(100, Math.round(correct * 7)));
    }
  }, [left, correct, onDone]);

  useEffect(() => { inputRef.current?.focus(); }, [problem]);

  const submit = () => {
    if (left === 0 || value.trim() === '') return;
    const ok = Number(value) === problem.ans;
    if (ok) setCorrect((c) => c + 1);
    setFlash(ok ? 'ok' : 'no');
    window.setTimeout(() => setFlash(null), 350);
    setValue('');
    setProblem(gen(ok ? level : Math.max(1, level - 1)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6 text-sm">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600 flex items-center gap-1"><X className="w-4 h-4" /> Sair</button>
          <span className="font-mono text-slate-500">Nível {level}</span>
          <span className={`font-mono font-bold ${left <= 10 ? 'text-red-500' : 'text-brand'}`}>{left}s</span>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Cálculo mental</div>
          <div className={`text-5xl font-extrabold mb-6 transition-colors ${flash === 'ok' ? 'text-emerald-500' : flash === 'no' ? 'text-red-400' : 'text-ink'}`}>
            {problem.q}
          </div>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            disabled={left === 0}
            placeholder="?"
            className="w-40 text-center text-3xl font-bold border-2 border-slate-200 rounded-xl py-3 focus:outline-none focus:border-brand mb-4"
          />
          <button onClick={submit} disabled={left === 0} className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2">
            <Check className="w-5 h-5" /> Responder
          </button>
          <p className="text-sm text-slate-500 mt-4">Acertos: <b className="text-ink">{correct}</b></p>
        </div>
      </div>
    </div>
  );
}
