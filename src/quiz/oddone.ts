import { Question } from './types';
import { Spec, cell, SHAPES, COLORS } from './shapes';
import { pick, pickK, shuffle } from '../utils/rng';

// Odd-one-out: 4 figures share one property (the invariant), 1 breaks it.
// A second attribute (the decoy) varies freely across all 5 as a red herring,
// so the puzzle is "find the shared rule", not "spot the odd color".

type Attr = 'type' | 'color' | 'count';

const pool = (a: Attr): (string | number)[] => (a === 'type' ? SHAPES : a === 'color' ? COLORS : [1, 2, 3]);

const withAttr = (s: Spec, a: Attr, v: string | number): Spec =>
  a === 'type' ? { ...s, type: v as Spec['type'] }
  : a === 'color' ? { ...s, color: v as Spec['color'] }
  : { ...s, count: v as number };

export function generateOddOne(difficulty: number): Question {
  const invariant: Attr = difficulty <= 2 ? (pick(['type', 'color']) as Attr) : (pick(['count', 'color']) as Attr);
  const decoy = pick((['type', 'color', 'count'] as Attr[]).filter((a) => a !== invariant));
  const [shared, other] = pickK(pool(invariant), 2);
  const decoyVals = shuffle(pool(decoy));

  const base: Spec = { type: 'circle', size: 'medium', color: 'black', rotation: 0, count: 1 };
  const items = Array.from({ length: 5 }, (_, i) => {
    const odd = i === 4;
    let s = withAttr(base, invariant, odd ? other : shared);
    s = withAttr(s, decoy, decoyVals[i % decoyVals.length]);
    return { s, odd };
  });

  const shuffled = shuffle(items);
  return {
    type: 'oddone',
    difficulty,
    prompt: 'Qual figura é a diferente?',
    optionKind: 'pattern',
    options: shuffled.map((x) => cell(x.s)),
    correctAnswer: shuffled.findIndex((x) => x.odd),
  };
}
