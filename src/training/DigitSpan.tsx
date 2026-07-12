import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

// Span de dígitos (memória de trabalho). Mostra uma sequência que cresce a cada
// acerto; erra = acaba. Score 0..100 pelo maior span alcançado.
interface Props {
  onDone: (score: number) => void;
  onExit: () => void;
}

type Phase = 'show' | 'recall' | 'feedback';
const START = 3;

const randDigits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10));

export default function DigitSpan({ onDone, onExit }: Props) {
  const [span, setSpan] = useState(START);
  const [best, setBest] = useState(START - 1);
  const [seq, setSeq] = useState<number[]>(() => randDigits(START));
  const [shownIdx, setShownIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('show');
  const [value, setValue] = useState('');
  const [lastOk, setLastOk] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  // Animação de exibição: um dígito por vez.
  useEffect(() => {
    if (phase !== 'show') return;
    setShownIdx(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= seq.length) {
        window.clearInterval(id);
        window.setTimeout(() => setPhase('recall'), 500);
      } else {
        setShownIdx(i);
      }
    }, 800);
    return () => window.clearInterval(id);
  }, [phase, seq]);

  useEffect(() => { if (phase === 'recall') inputRef.current?.focus(); }, [phase]);

  const finish = (b: number) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(Math.min(100, Math.max(0, (b - 2) * 14)));
  };

  const check = () => {
    const ok = value === seq.join('');
    setLastOk(ok);
    setPhase('feedback');
    if (ok) {
      const nb = Math.max(best, span);
      setBest(nb);
      window.setTimeout(() => {
        const next = span + 1;
        setSpan(next);
        setSeq(randDigits(next));
        setValue('');
        setPhase('show');
      }, 1100);
    } else {
      window.setTimeout(() => finish(best), 1400);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6 text-sm">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600 flex items-center gap-1"><X className="w-4 h-4" /> Sair</button>
          <span className="font-mono text-slate-500">Span {span}</span>
          <span className="font-mono text-slate-500">Recorde {best}</span>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 mb-4">Memória de trabalho</div>

          {phase === 'show' && (
            <>
              <div className="text-6xl font-extrabold text-ink h-24 flex items-center justify-center tabular-nums">{seq[shownIdx]}</div>
              <p className="text-sm text-slate-500 mt-4">Memorize a sequência…</p>
            </>
          )}

          {phase === 'recall' && (
            <>
              <p className="text-sm text-slate-600 mb-3">Digite os {span} dígitos na ordem:</p>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, span))}
                onKeyDown={(e) => e.key === 'Enter' && value.length === span && check()}
                className="w-full text-center text-3xl font-bold tracking-[0.3em] border-2 border-slate-200 rounded-xl py-3 focus:outline-none focus:border-brand mb-4"
              />
              <button onClick={check} disabled={value.length !== span} className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-40">
                Confirmar
              </button>
            </>
          )}

          {phase === 'feedback' && (
            <div className="h-32 flex flex-col items-center justify-center">
              <div className={`text-2xl font-extrabold ${lastOk ? 'text-emerald-500' : 'text-red-400'}`}>{lastOk ? 'Certo! Subindo…' : 'Errou'}</div>
              <div className="text-slate-500 mt-2 tabular-nums">{seq.join(' ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
