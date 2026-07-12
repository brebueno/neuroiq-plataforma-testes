import { useState } from 'react';
import { Flame, Calculator, Brain, LayoutGrid, Dumbbell, Moon, GraduationCap, Check, ArrowLeft, TrendingUp } from 'lucide-react';
import MentalMath from '../training/MentalMath';
import DigitSpan from '../training/DigitSpan';
import NBack from '../training/NBack';
import { loadTraining, recordExercise, toggleHabit, todayHabits, TrainingData } from '../utils/training';

interface Props {
  onExit: () => void;
}

type ExKey = 'math' | 'span' | 'nback';

const EXERCISES: { key: ExKey; label: string; desc: string; icon: typeof Calculator }[] = [
  { key: 'math', label: 'Cálculo mental', desc: 'Velocidade de raciocínio numérico', icon: Calculator },
  { key: 'span', label: 'Memória de trabalho', desc: 'Span de dígitos crescente', icon: Brain },
  { key: 'nback', label: 'N-back (2 atrás)', desc: 'Atenção e memória de trabalho', icon: LayoutGrid },
];

const HABITS: { key: 'aerobic' | 'sleep' | 'skill'; label: string; icon: typeof Dumbbell }[] = [
  { key: 'aerobic', label: 'Exercício aeróbico', icon: Dumbbell },
  { key: 'sleep', label: 'Dormi 7-8h', icon: Moon },
  { key: 'skill', label: 'Pratiquei skill nova', icon: GraduationCap },
];

// Sparkline da evolução do Índice de Treino.
function Spark({ data }: { data: { index: number }[] }) {
  if (data.length < 2) return <div className="text-xs text-slate-400 mt-1">Faça treinos pra ver sua curva evoluir.</div>;
  const w = 260, h = 56, pad = 4;
  const vals = data.map((d) => d.index);
  const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
  const d = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full mt-1">
      <path d={`${d} L${x(vals.length - 1)} ${h} L${x(0)} ${h} Z`} fill="rgba(18,160,140,0.10)" />
      <path d={d} fill="none" stroke="#12A08C" strokeWidth="2" />
      <circle cx={x(vals.length - 1)} cy={y(vals[vals.length - 1])} r="3.5" fill="#12A08C" />
    </svg>
  );
}

export default function Platform({ onExit }: Props) {
  const [data, setData] = useState<TrainingData>(() => loadTraining());
  const [active, setActive] = useState<ExKey | null>(null);

  const finish = (key: ExKey, score: number) => {
    setData(recordExercise(key, score));
    setActive(null);
  };

  if (active === 'math') return <MentalMath onDone={(s) => finish('math', s)} onExit={() => setActive(null)} />;
  if (active === 'span') return <DigitSpan onDone={(s) => finish('span', s)} onExit={() => setActive(null)} />;
  if (active === 'nback') return <NBack onDone={(s) => finish('nback', s)} onExit={() => setActive(null)} />;

  const hb = todayHabits(data);
  const doneCount = data.todayDone.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white py-8 px-4">
      <div className="max-w-md mx-auto">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Início</button>

        {/* Header: streak + índice */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <Flame className={`w-8 h-8 ${data.streak > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
            <div>
              <div className="text-2xl font-extrabold text-ink tabular-nums">{data.streak}</div>
              <div className="text-[11px] text-slate-500">dias de streak</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1 text-[11px] text-slate-500"><TrendingUp className="w-3.5 h-3.5" /> Índice de Treino</div>
            <div className="text-2xl font-extrabold text-brand tabular-nums">{data.index}</div>
          </div>
        </div>

        {/* Curva de evolução */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 shadow-sm">
          <div className="text-sm font-semibold text-ink">Sua evolução</div>
          <Spark data={data.history} />
          <p className="text-[11px] text-slate-400 mt-1">Seu score no app, não seu QI. Sobe com treino e consistência.</p>
        </div>

        {/* Treino de hoje */}
        <h3 className="font-bold text-ink mb-2">Treino de hoje <span className="text-slate-400 font-normal text-sm">({doneCount}/{EXERCISES.length})</span></h3>
        <div className="space-y-2.5 mb-6">
          {EXERCISES.map((ex) => {
            const done = data.todayDone.includes(ex.key);
            const best = data.bestByExercise[ex.key];
            return (
              <button
                key={ex.key}
                onClick={() => setActive(ex.key)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-colors ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-brand'}`}
              >
                <span className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 ${done ? 'bg-emerald-100' : 'bg-brand-light'}`}>
                  <ex.icon className={`w-5 h-5 ${done ? 'text-emerald-600' : 'text-brand'}`} />
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-ink flex items-center gap-2">{ex.label}{done && <Check className="w-4 h-4 text-emerald-600" />}</div>
                  <div className="text-[12px] text-slate-500">{ex.desc}{best != null && ` · melhor ${best}`}</div>
                </div>
                <span className="text-brand font-semibold text-sm">{done ? 'Repetir' : 'Treinar'}</span>
              </button>
            );
          })}
        </div>

        {/* Hábitos de hoje (estilo GymRats) */}
        <h3 className="font-bold text-ink mb-1">Hábitos de hoje</h3>
        <p className="text-[12px] text-slate-500 mb-3">O que tem mais evidência de ajudar o cérebro de verdade.</p>
        <div className="space-y-2.5">
          {HABITS.map((h) => {
            const on = hb[h.key];
            return (
              <button
                key={h.key}
                onClick={() => setData(toggleHabit(h.key))}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${on ? 'bg-brand text-white border-brand' : 'bg-white border-slate-200 hover:border-brand'}`}
              >
                <h.icon className={`w-5 h-5 ${on ? 'text-white' : 'text-brand'}`} />
                <span className={`flex-1 text-left font-medium ${on ? 'text-white' : 'text-ink'}`}>{h.label}</span>
                <span className={`w-6 h-6 rounded-full grid place-items-center ${on ? 'bg-white/20' : 'border-2 border-slate-200'}`}>
                  {on && <Check className="w-4 h-4 text-white" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
