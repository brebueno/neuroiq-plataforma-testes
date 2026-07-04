import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { LikertItem } from '../data/bigFive';

interface LikertTestProps {
  title: string;
  items: LikertItem[];
  onComplete: (answers: number[]) => void;
  onExit: () => void;
}

const OPTIONS = [
  { value: 1, label: 'Discordo totalmente' },
  { value: 2, label: 'Discordo' },
  { value: 3, label: 'Neutro' },
  { value: 4, label: 'Concordo' },
  { value: 5, label: 'Concordo totalmente' },
];

export default function LikertTest({ title, items, onComplete, onExit }: LikertTestProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const answer = (value: number) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);

    if (index + 1 >= items.length) {
      onComplete(next);
    } else {
      setIndex(index + 1);
    }
  };

  const item = items[index];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-gray-600 hover:text-gray-800 transition-colors">
              <RotateCcw className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>
          <span className="text-gray-600 text-sm">
            {index + 1}/{items.length}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-10">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(index / items.length) * 100}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <p className="text-center text-sm text-gray-400 mb-4">O quanto isso combina com você?</p>
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8 min-h-[4rem] flex items-center justify-center">
            {item.text}
          </h2>

          <div className="space-y-3">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => answer(opt.value)}
                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-gray-700"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
