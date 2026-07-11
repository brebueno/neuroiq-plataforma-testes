import { Question } from './types';
import { Spec, cell, specKey, SHAPES, COLORS, SIZES } from './shapes';
import { pick, shuffle } from '../utils/rng';

// Figural analogy A : B :: C : ?, B = T(A), the answer = T(C). A single,
// clear transformation, a "2x2 matrix" that feels different from a 3x3.

type TName = 'rotate' | 'grow' | 'recolor' | 'count' | 'morph';

const ASYM: Spec['type'][] = ['triangle', 'diamond', 'cross', 'star'];

function transform(s: Spec, t: TName): Spec {
  switch (t) {
    case 'rotate': return { ...s, rotation: ((s.rotation ?? 0) + 90) % 180 };
    case 'grow': return { ...s, size: SIZES[Math.min(2, SIZES.indexOf(s.size ?? 'medium') + 1)] };
    case 'recolor': return { ...s, color: COLORS[(COLORS.indexOf(s.color ?? 'black') + 1) % COLORS.length] };
    case 'count': return { ...s, count: Math.min(3, (s.count ?? 1) + 1) };
    case 'morph': return { ...s, type: SHAPES[(SHAPES.indexOf(s.type) + 1) % SHAPES.length] };
  }
}

function makeBase(t: TName): Spec {
  const b: Spec = { type: pick(SHAPES), size: 'medium', color: pick(COLORS), rotation: 0, count: 1 };
  switch (t) {
    case 'rotate': return { ...b, type: pick(ASYM), rotation: pick([0, 45]) };
    case 'grow': return { ...b, size: pick(['small', 'medium']) };
    case 'recolor': return { ...b, color: pick(['black', 'gray']) };
    case 'count': return { ...b, size: 'small', count: pick([1, 2]) };
    case 'morph': return b;
  }
}

const transformByDifficulty = (d: number): TName =>
  d <= 2 ? pick(['rotate', 'recolor', 'grow']) : pick(['morph', 'count', 'rotate']);

export function generateAnalogy(difficulty: number): Question {
  const t = transformByDifficulty(difficulty);
  const a = makeBase(t);
  const b = transform(a, t);
  let c = makeBase(t);
  let guard = 0;
  while (specKey(c) === specKey(a) && guard++ < 20) c = makeBase(t);
  const answer = transform(c, t);

  const others: TName[] = (['rotate', 'grow', 'recolor', 'count', 'morph'] as TName[]).filter((x) => x !== t);
  const cand: Spec[] = [
    c, // untransformed
    transform(c, pick(others)), // wrong transform
    transform(answer, t), // applied twice
    { ...answer, color: COLORS[(COLORS.indexOf(answer.color ?? 'black') + 1) % 3] }, // near-miss color
  ];

  const seen = new Set([specKey(answer)]);
  const distractors: Spec[] = [];
  for (const d of cand) {
    const k = specKey(d);
    if (!seen.has(k)) { seen.add(k); distractors.push(d); }
    if (distractors.length >= 3) break;
  }
  while (distractors.length < 3) {
    const d: Spec = { ...answer, type: pick(SHAPES) };
    if (!seen.has(specKey(d))) { seen.add(specKey(d)); distractors.push(d); }
  }

  const options = shuffle([answer, ...distractors]);
  return {
    type: 'analogy',
    difficulty,
    prompt: 'A está para B assim como C está para…',
    optionKind: 'pattern',
    options: options.map(cell),
    correctAnswer: options.findIndex((s) => specKey(s) === specKey(answer)),
    analogyRow: [cell(a), cell(b), cell(c)],
  };
}
