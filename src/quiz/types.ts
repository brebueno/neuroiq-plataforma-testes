import { Pattern } from '../types/game';

// A question in the IQ test. Multiple TYPES share this shape so the test can
// interleave them — matrix, number/letter series, odd-one-out, analogy — which
// is what real multi-type IQ tests (ICAR/WAIS) do to kill monotony.
export type QType = 'matrix' | 'series' | 'oddone' | 'analogy';

export interface Question {
  type: QType;
  difficulty: number; // 1..6 — used as the scoring weight (maps to Level)
  prompt: string;
  optionKind: 'pattern' | 'text';
  options: (Pattern | string)[];
  correctAnswer: number;

  // Display payloads, by type:
  matrix?: (Pattern | null)[][]; // matrix: the 3x3 grid (cell 8 = null)
  sequence?: string[]; // series: terms to show, last is '?'
  analogyRow?: Pattern[]; // analogy: [A, B, C]
  // odd-one-out reuses `options` as the row of figures.
}
