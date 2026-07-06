import { Question } from './types';
import { randInt, pick, shuffle } from '../utils/rng';

// ---- Number series -------------------------------------------------------
// Difficulty scales with the number/complexity of operations (validated: the
// jump from 1-step to 2-step rules explains most of item difficulty).

type Family = 'arithmetic' | 'geometric' | 'fibonacci' | 'quadratic' | 'interleave' | 'twoStep';

const familyByDifficulty = (d: number): Family => {
  if (d <= 1) return pick(['arithmetic', 'arithmetic', 'geometric']) as Family;
  if (d === 2) return pick(['geometric', 'arithmetic']) as Family;
  if (d === 3) return pick(['fibonacci', 'quadratic']) as Family;
  return pick(['interleave', 'twoStep', 'quadratic']) as Family;
};

function buildTerms(family: Family): number[] {
  switch (family) {
    case 'arithmetic': {
      const start = randInt(8) + 2;
      const step = randInt(8) + 2;
      return Array.from({ length: 6 }, (_, i) => start + step * i);
    }
    case 'geometric': {
      const start = randInt(3) + 2;
      const r = randInt(2) + 2;
      return Array.from({ length: 6 }, (_, i) => start * r ** i);
    }
    case 'fibonacci': {
      const a = randInt(4) + 1;
      const b = randInt(5) + 2;
      const t = [a, b];
      while (t.length < 6) t.push(t[t.length - 1] + t[t.length - 2]);
      return t;
    }
    case 'quadratic': {
      const start = randInt(5) + 1;
      const d0 = randInt(4) + 1;
      const dd = randInt(3) + 1;
      return Array.from({ length: 6 }, (_, i) => start + d0 * i + (dd * i * (i - 1)) / 2);
    }
    case 'interleave': {
      const sa = randInt(6) + 1;
      const da = randInt(5) + 2;
      const sb = randInt(9) + 3;
      const db = randInt(4) + 2;
      const t: number[] = [];
      for (let i = 0; t.length < 6; i++) {
        t.push(sa + da * i);
        if (t.length < 6) t.push(sb + db * i);
      }
      return t;
    }
    case 'twoStep': {
      const m = randInt(2) + 2;
      const a = randInt(5) + 1;
      const t = [randInt(3) + 1];
      while (t.length < 6) t.push(t[t.length - 1] * m + a);
      return t;
    }
  }
}

export function generateNumberSeries(difficulty: number): Question {
  const family = familyByDifficulty(difficulty);
  const terms = buildTerms(family);
  const next = terms[5];
  const shown = terms.slice(0, 5);
  const last = shown[4];

  const cand = new Set<number>([
    next + 1, next - 1, next + 2, next - 2,
    last, last + (last - shown[3]), // naive linear continuation
    Math.round(next * 1.5), next + (shown[4] - shown[3]),
  ]);
  cand.delete(next);
  let distractors = [...cand].filter((n) => Number.isInteger(n) && n > 0 && n !== next);
  distractors = shuffle(distractors).slice(0, 5);
  let guard = 0;
  while (distractors.length < 5 && guard++ < 30) {
    const d = next + (randInt(11) - 5);
    if (d > 0 && d !== next && !distractors.includes(d)) distractors.push(d);
  }

  const options = shuffle([next, ...distractors]);
  return {
    type: 'series',
    difficulty,
    prompt: 'Qual número completa a sequência?',
    optionKind: 'text',
    options: options.map(String),
    correctAnswer: options.indexOf(next),
    sequence: [...shown.map(String), '?'],
  };
}

// ---- Letter series -------------------------------------------------------
const L = (i: number) => String.fromCharCode(65 + (((i % 26) + 26) % 26));

export function generateLetterSeries(difficulty: number): Question {
  const interleave = difficulty >= 3 && randInt(2) === 0;
  const codes: number[] = [];
  if (interleave) {
    let a = randInt(10);
    let b = randInt(10) + 12;
    const da = randInt(3) + 1;
    const db = -(randInt(3) + 1);
    for (let i = 0; codes.length < 6; i++) {
      codes.push(a); a += da;
      if (codes.length < 6) { codes.push(b); b += db; }
    }
  } else {
    let c = randInt(8);
    const step = difficulty <= 2 ? randInt(2) + 1 : randInt(4) + 2;
    for (let i = 0; i < 6; i++) { codes.push(c); c += step; }
  }

  const nextCode = codes[5];
  const shown = codes.slice(0, 5).map(L);
  const nextL = L(nextCode);

  const cand = new Set<string>([L(nextCode + 1), L(nextCode - 1), L(nextCode + 2), shown[4], L(nextCode + 3), L(25 - nextCode)]);
  cand.delete(nextL);
  const distractors = shuffle([...cand]).slice(0, 5);
  let guard = 0;
  while (distractors.length < 5 && guard++ < 30) {
    const d = L(nextCode + (randInt(9) - 4));
    if (d !== nextL && !distractors.includes(d)) distractors.push(d);
  }

  const options = shuffle([nextL, ...distractors]);
  return {
    type: 'series',
    difficulty,
    prompt: 'Qual letra completa a sequência?',
    optionKind: 'text',
    options,
    correctAnswer: options.indexOf(nextL),
    sequence: [...shown, '?'],
  };
}
