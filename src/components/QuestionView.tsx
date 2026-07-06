import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Level, Pattern, QuestionResult } from '../types/game';
import { Question } from '../quiz/types';
import { calculateQuestionIQ } from '../utils/iqCalculator';
import { updateQuestionStats } from '../utils/localStorage';
import PatternDisplay from './PatternDisplay';

interface Props {
  question: Question;
  index: number;
  onAnswer: (result: QuestionResult) => void;
}

const RESULT_DELAY = 1600;

export default function QuestionView({ question, index, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    setSelected(null);
    setShowResult(false);
    setStartTime(Date.now());
  }, [question, index]);

  const choose = (i: number) => {
    if (showResult) return;
    const correct = i === question.correctAnswer;
    setSelected(i);
    setShowResult(true);
    updateQuestionStats(correct);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const iq = calculateQuestionIQ(question.difficulty as Level, correct);
    setTimeout(() => {
      onAnswer({ level: question.difficulty as Level, questionIndex: index, correct, timeSpent, iq });
    }, RESULT_DELAY);
  };

  const isCorrect = selected === question.correctAnswer;

  // ---- shared option cell styling ----
  const optClass = (i: number, base: string) => {
    if (selected === i) return isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
    if (showResult && i === question.correctAnswer) return 'border-green-500 bg-green-50';
    return base;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6 text-center">{question.prompt}</h2>

        {/* ---- stimulus by type ---- */}
        {question.type === 'matrix' && question.matrix && (
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-2">
            {question.matrix.flat().map((p, i) => (
              <div
                key={i}
                className={`aspect-square border-2 rounded-lg flex items-center justify-center ${
                  p === null ? 'border-dashed border-teal-300 bg-teal-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {p ? <PatternDisplay pattern={p} size={70} /> : <span className="text-3xl text-teal-400 font-bold">?</span>}
              </div>
            ))}
          </div>
        )}

        {question.type === 'series' && question.sequence && (
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 py-6">
            {question.sequence.map((t, i) => (
              <span
                key={i}
                className={`text-3xl md:text-4xl font-extrabold tabular-nums ${
                  t === '?' ? 'text-teal-500 w-14 h-14 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 flex items-center justify-center' : 'text-gray-800'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {question.type === 'analogy' && question.analogyRow && (
          <div className="flex items-center justify-center gap-2 md:gap-3 py-4 flex-wrap">
            <Fig p={question.analogyRow[0]} />
            <span className="text-2xl text-gray-400 font-bold">:</span>
            <Fig p={question.analogyRow[1]} />
            <span className="text-2xl text-gray-400 font-bold px-1">::</span>
            <Fig p={question.analogyRow[2]} />
            <span className="text-2xl text-gray-400 font-bold">:</span>
            <span className="w-16 h-16 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 flex items-center justify-center text-2xl text-teal-400 font-bold">?</span>
          </div>
        )}
      </div>

      {/* ---- options ---- */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        {question.optionKind === 'pattern' ? (
          <div className={`grid gap-3 mx-auto ${question.type === 'oddone' ? 'grid-cols-3 md:grid-cols-5 max-w-2xl' : 'grid-cols-3 max-w-sm'}`}>
            {(question.options as Pattern[]).map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={showResult}
                className={`relative aspect-square border-2 rounded-lg flex items-center justify-center transition-all ${optClass(
                  i,
                  'border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50',
                )} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <PatternDisplay pattern={opt} size={64} />
                {showResult && (selected === i || i === question.correctAnswer) && (
                  <span className="absolute -top-2 -right-2">
                    {i === question.correctAnswer ? (
                      <Check className="w-6 h-6 text-green-600 bg-white rounded-full p-1" />
                    ) : selected === i ? (
                      <X className="w-6 h-6 text-red-600 bg-white rounded-full p-1" />
                    ) : null}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            {(question.options as string[]).map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={showResult}
                className={`py-4 px-3 rounded-xl border-2 text-xl font-bold tabular-nums transition-all ${optClass(
                  i,
                  'border-gray-200 text-gray-800 hover:border-teal-400 hover:bg-teal-50',
                )} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Fig({ p }: { p: Pattern }) {
  return (
    <span className="w-16 h-16 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
      <PatternDisplay pattern={p} size={56} />
    </span>
  );
}
