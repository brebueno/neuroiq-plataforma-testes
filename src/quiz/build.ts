import { Question, QType } from './types';
import { generateMatrix } from './matrix';
import { generateNumberSeries, generateLetterSeries } from './series';
import { generateOddOne } from './oddone';
import { generateAnalogy } from './analogy';

// The recipe: a real multi-type IQ test (ICAR-style). Types are INTERLEAVED so
// no two neighbours share a format, and difficulty ramps across the test.
// Matrix is the biggest block (best marker of g); the other types kill the
// "every question looks the same" problem.

type Slot = 'matrix' | 'num' | 'letter' | 'oddone' | 'analogy';

const PLAN: [Slot, number][] = [
  ['matrix', 2], ['num', 1], ['oddone', 1], ['analogy', 2],
  ['matrix', 2], ['letter', 2], ['num', 2], ['oddone', 2],
  ['matrix', 3], ['analogy', 3], ['letter', 3], ['num', 3],
  ['matrix', 3], ['oddone', 3], ['analogy', 4], ['matrix', 4],
  ['letter', 4], ['num', 4], ['oddone', 4], ['matrix', 4],
  ['analogy', 4], ['num', 5], ['matrix', 5], ['oddone', 5],
  ['letter', 5], ['analogy', 5], ['matrix', 5], ['num', 5],
  ['matrix', 6], ['oddone', 5], ['analogy', 5], ['matrix', 6],
];

const gen = (slot: Slot, d: number): Question => {
  switch (slot) {
    case 'matrix': return generateMatrix(d);
    case 'num': return generateNumberSeries(d);
    case 'letter': return generateLetterSeries(d);
    case 'oddone': return generateOddOne(d);
    case 'analogy': return generateAnalogy(d);
  }
};

export const QUIZ_LENGTH = PLAN.length;

export function buildQuiz(): Question[] {
  return PLAN.map(([slot, d]) => gen(slot, d));
}

// Labels for the in-test chip.
export const TYPE_LABEL: Record<QType, string> = {
  matrix: 'Padrão',
  series: 'Sequência',
  oddone: 'O diferente',
  analogy: 'Analogia',
};
