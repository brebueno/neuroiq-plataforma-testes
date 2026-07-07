import { Question, QType } from './types';
import { generateMatrix } from './matrix';
import { generateNumberSeries, generateLetterSeries } from './series';
import { generateOddOne } from './oddone';
import { generateAnalogy } from './analogy';
import { generateVerbalAnalogy, generateVerbalOddOne } from './verbal';

// The recipe: a real multi-type IQ test (ICAR-style). Types are INTERLEAVED so
// no two neighbours share a format, and difficulty ramps across the test.
// Matrix is the biggest block (best marker of g); the other types kill the
// "every question looks the same" problem.

type Slot = 'matrix' | 'num' | 'letter' | 'oddone' | 'analogy' | 'vanalogy' | 'voddone';

// Interleaved so no two neighbours share a format, and VISUAL / VERBAL /
// NUMERIC alternate — this is what kills the "every question looks the same"
// feeling. Matrix stays the largest single block (best marker of g), but no
// longer dominates. Difficulty ramps 1 → 6 across the test.
const PLAN: [Slot, number][] = [
  ['matrix', 1], ['vanalogy', 1], ['num', 1], ['voddone', 1],
  ['matrix', 2], ['analogy', 2], ['letter', 2], ['vanalogy', 2],
  ['num', 2], ['voddone', 3], ['matrix', 3], ['oddone', 3],
  ['vanalogy', 3], ['letter', 3], ['num', 4], ['analogy', 4],
  ['matrix', 4], ['voddone', 4], ['vanalogy', 4], ['num', 5],
  ['matrix', 5], ['oddone', 5], ['letter', 5], ['vanalogy', 5],
  ['num', 5], ['analogy', 5], ['matrix', 6], ['voddone', 5],
  ['vanalogy', 6], ['matrix', 6],
];

const gen = (slot: Slot, d: number): Question => {
  switch (slot) {
    case 'matrix': return generateMatrix(d);
    case 'num': return generateNumberSeries(d);
    case 'letter': return generateLetterSeries(d);
    case 'oddone': return generateOddOne(d);
    case 'analogy': return generateAnalogy(d);
    case 'vanalogy': return generateVerbalAnalogy(d);
    case 'voddone': return generateVerbalOddOne(d);
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
  oddone: 'O diferente (figuras)',
  analogy: 'Analogia (figuras)',
  'verbal-analogy': 'Analogia verbal',
  'verbal-oddone': 'O diferente (palavras)',
};
