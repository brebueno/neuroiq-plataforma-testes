import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { LikertItem } from '../data/bigFive';

interface LikertTestProps {
  title: string;
  items: LikertItem[];
  onComplete: (answers: number[]) => void;
  onExit: () => void;
}

// Agree-scale as a graded circle row (16personalities-style): the poles carry
// the words, the circles carry the weight. One tap advances.
const SCALE = [
  { v: 1, size: 56, cls: 'border-rose-400 hover:bg-rose-400' },
  { v: 2, size: 46, cls: 'border-rose-300 hover:bg-rose-300' },
  { v: 3, size: 38, cls: 'border-gray-300 hover:bg-gray-300' },
  { v: 4, size: 46, cls: 'border-teal-300 hover:bg-teal-300' },
  { v: 5, size: 56, cls: 'border-teal-500 hover:bg-teal-500' },
];

export default function LikertTest({ title, items, onComplete, onExit }: LikertTestProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const answer = (value: number) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    if (index + 1 >= items.length) onComplete(next);
    else setIndex(index + 1);
  };

  const item = items[index];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-gray-500 hover:text-gray-800 transition-colors">
              <RotateCcw className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-ink">{title}</h1>
          </div>
          <span className="text-gray-500 text-sm tabular-nums">{index + 1} de {items.length}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-12">
          <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(index / items.length) * 100}%` }} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
          <h2 className="text-2xl md:text-[28px] font-bold text-ink text-center mb-10 min-h-[3.5rem] flex items-center justify-center text-balance leading-snug">
            {item.text}
          </h2>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-rose-500 w-16 md:w-20">Discordo</span>
            <div className="flex items-center gap-3 md:gap-4">
              {SCALE.map((s) => (
                <button
                  key={s.v}
                  onClick={() => answer(s.v)}
                  aria-label={`Nível ${s.v}`}
                  className={`rounded-full border-2 transition-all duration-150 hover:scale-110 ${s.cls}`}
                  style={{ width: s.size, height: s.size }}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-teal-600 w-16 md:w-20 text-right">Concordo</span>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">Não existe resposta certa. Responda pensando em como você realmente é.</p>
      </div>
    </div>
  );
}
