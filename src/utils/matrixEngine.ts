import { Level, Puzzle, Pattern, Shape, FillStyle } from '../types/game';
import { pick, pickK, shuffle, chance } from './rng';

// ---------------------------------------------------------------------------
// Matrix reasoning engine.
//
// The old generator knew ONE rule: an arithmetic progression across a shifted
// sequence. Every puzzle "felt the same" because it always reasoned the same
// way. This engine implements the five rule families that real Raven-style
// matrices are built from (Carpenter, Just & Shell, 1990):
//
//   1. Constant in a row       — attribute fixed along a row, changes by row
//   2. Progression             — attribute steps left→right across columns
//   3. Distribution of three   — 3 values, each appears once per row & column
//   4. Distribution of two     — 2 values + a blank, distributed per row
//   5. Figure addition/subtr.  — cell 3 = cell 1 (∪ / \) cell 2
//
// Difficulty scales with how many attributes vary at once. Because a puzzle is
// composed from {rule family × attribute × stacking × geometry}, the space of
// structurally distinct puzzles is effectively unbounded — retaking the test
// never shows the same reasoning twice.
// ---------------------------------------------------------------------------

type ShapeType = Shape['type'];
type Size = Shape['size'];
type Color = Shape['color'];

const TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star'];
const ASYM: ShapeType[] = ['triangle', 'diamond', 'cross', 'star']; // rotation is only visible on these
const SIZES: Size[] = ['small', 'medium', 'large'];
const COLORS: Color[] = ['black', 'gray', 'white'];
const FILLS: FillStyle[] = ['solid', 'hollow', 'hatch', 'dots'];
const ROTATIONS = [0, 45, 90, 135];

// A cell's content, before it becomes SVG shapes. count 0 = empty cell.
interface Spec {
  type: ShapeType;
  size: Size;
  color: Color;
  fill?: FillStyle;
  rotation: number;
  count: number;
}

const positionsFor = (count: number): { x: number; y: number }[] => {
  switch (count) {
    case 0: return [];
    case 1: return [{ x: 0.5, y: 0.5 }];
    case 2: return [{ x: 0.34, y: 0.5 }, { x: 0.66, y: 0.5 }];
    case 3: return [{ x: 0.3, y: 0.34 }, { x: 0.5, y: 0.66 }, { x: 0.7, y: 0.34 }];
    default: return [{ x: 0.5, y: 0.5 }];
  }
};

const specToPattern = (s: Spec): Pattern => ({
  shapes: positionsFor(s.count).map((p) => ({
    type: s.type, size: s.size, color: s.color, fill: s.fill ?? 'solid', rotation: s.rotation, position: p,
  })),
});

const specKey = (s: Spec) => `${s.type}|${s.size}|${s.color}|${s.fill ?? 'solid'}|${s.rotation}|${s.count}`;

const patternKey = (p: Pattern) =>
  p.shapes
    .map((sh) => `${sh.type}${sh.size}${sh.color}${sh.rotation}@${sh.position?.x},${sh.position?.y}`)
    .sort()
    .join(';');

// What each builder hands back: the full 3×3 grid, the correct bottom-right
// cell, and a set of plausible wrong options.
interface Built {
  cells: Pattern[][];
  answer: Pattern;
  distractors: Pattern[];
}

// --------------------------- attribute-rule modes --------------------------
// Covers rule families 1–3, applied to any visual attribute.

type Attr = 'type' | 'size' | 'color' | 'rotation' | 'count' | 'fill';
type Rule = 'constant' | 'progression' | 'dist3';
type AttrVal = ShapeType | Size | Color | number | FillStyle;

const valuePool = (attr: Attr, asym: boolean): AttrVal[] => {
  switch (attr) {
    case 'type': return pickK(asym ? ASYM : TYPES, 3);
    case 'size': return [...SIZES];
    case 'color': return shuffle([...COLORS]);
    case 'rotation': return pickK(ROTATIONS, 3);
    case 'count': return [1, 2, 3];
    case 'fill': return pickK(FILLS, 3);
  }
};

const applyAttr = (s: Spec, attr: Attr, v: AttrVal) => {
  if (attr === 'type') s.type = v as ShapeType;
  else if (attr === 'size') s.size = v as Size;
  else if (attr === 'color') s.color = v as Color;
  else if (attr === 'rotation') s.rotation = v as number;
  else if (attr === 'fill') s.fill = v as FillStyle;
  else s.count = v as number;
};

const idxFor = (rule: Rule, r: number, c: number, len: number): number => {
  if (rule === 'constant') return r % len;      // fixed within a row
  if (rule === 'progression') return c % len;   // steps across columns
  return (r + c) % len;                          // distribution of three (Latin square)
};

function buildAttributeMode(numAttrs: number, rules: Rule[], allowRotation: boolean): Built {
  const attrPool: Attr[] = ['type', 'size', 'color', 'count', 'fill', ...(allowRotation ? (['rotation'] as Attr[]) : [])];
  let attrs = pickK(attrPool, numAttrs);
  // size + count together get visually cramped — keep count, drop size.
  if (attrs.includes('size') && attrs.includes('count')) attrs = attrs.filter((a) => a !== 'size');

  const rotationUsed = attrs.includes('rotation');
  const base: Spec = {
    type: rotationUsed ? pick(ASYM) : pick(TYPES),
    size: 'medium',
    color: pick(COLORS),
    rotation: 0,
    count: 1,
  };
  if (attrs.includes('count')) base.size = 'small'; // keep multi-shape cells readable

  const plans = attrs.map((attr) => ({ attr, rule: pick(rules), values: valuePool(attr, rotationUsed) }));

  const specAt = (r: number, c: number): Spec => {
    const s: Spec = { ...base };
    plans.forEach((pl) => applyAttr(s, pl.attr, pl.values[idxFor(pl.rule, r, c, pl.values.length)]));
    return s;
  };

  const cellSpecs: Spec[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => specAt(r, c)));
  const answer = cellSpecs[2][2];
  const distractors = buildAttributeDistractors(answer, plans);

  return {
    cells: cellSpecs.map((row) => row.map(specToPattern)),
    answer: specToPattern(answer),
    distractors: distractors.map(specToPattern),
  };
}

// Strongest distractors change exactly one varying attribute; then top up with
// perturbations of any attribute so there are always enough options.
function buildAttributeDistractors(answer: Spec, plans: { attr: Attr; values: AttrVal[] }[]): Spec[] {
  const seen = new Set<string>([specKey(answer)]);
  const out: Spec[] = [];
  const add = (s: Spec) => {
    const k = specKey(s);
    if (!seen.has(k)) { seen.add(k); out.push(s); }
  };

  plans.forEach((pl) => {
    const wrong = pl.values.filter((v) => {
      const probe = { ...answer };
      applyAttr(probe, pl.attr, v);
      return specKey(probe) !== specKey(answer);
    });
    if (wrong.length) {
      const d = { ...answer };
      applyAttr(d, pl.attr, pick(wrong));
      add(d);
    }
  });

  const allAttrs: Attr[] = ['type', 'size', 'color', 'rotation', 'count', 'fill'];
  let guard = 0;
  while (out.length < 5 && guard < 200) {
    guard++;
    const d = { ...answer };
    const attr = pick(allAttrs);
    const pool: AttrVal[] =
      attr === 'type' ? TYPES : attr === 'size' ? SIZES : attr === 'color' ? COLORS
      : attr === 'rotation' ? ROTATIONS : attr === 'fill' ? FILLS : [1, 2, 3];
    applyAttr(d, attr, pick(pool));
    add(d);
  }
  return out.slice(0, 5);
}

// ------------------------ distribution-of-two + blank ----------------------

function buildDist2Mode(): Built {
  const [tA, tB] = pickK(TYPES, 2);
  const color = pick(COLORS);
  const filled = (t: ShapeType): Spec => ({ type: t, size: 'medium', color, rotation: 0, count: 1 });
  const blank: Spec = { type: tA, size: 'medium', color, rotation: 0, count: 0 };

  // state 0 → A, 1 → B, 2 → blank, distributed Latin-square style.
  const stateSpec = (state: number): Spec => (state === 2 ? blank : filled(state === 0 ? tA : tB));
  const cellSpecs: Spec[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => stateSpec((r + c) % 3)));
  const answer = cellSpecs[2][2];

  const seen = new Set<string>([specKey(answer)]);
  const distractors: Spec[] = [];
  const candidates: Spec[] = [
    filled(tA),
    blank,
    { type: tB, size: 'medium', color, rotation: 0, count: 2 },
    { type: tA, size: 'medium', color, rotation: 0, count: 2 },
    filled(pick(TYPES.filter((t) => t !== tA && t !== tB))),
    { type: tB, size: 'large', color, rotation: 0, count: 1 },
  ];
  candidates.forEach((c) => {
    const k = specKey(c);
    if (distractors.length < 5 && !seen.has(k)) { seen.add(k); distractors.push(c); }
  });

  return {
    cells: cellSpecs.map((row) => row.map(specToPattern)),
    answer: specToPattern(answer),
    distractors: distractors.map(specToPattern),
  };
}

// ------------------------ figure addition / subtraction --------------------

const SLOTS = [{ x: 0.3, y: 0.35 }, { x: 0.7, y: 0.35 }, { x: 0.5, y: 0.72 }];

function buildAdditionMode(subtract: boolean): Built {
  const universe = pickK(TYPES, 3);
  const color = pick(COLORS);
  const slotOf: Record<string, { x: number; y: number }> = {};
  universe.forEach((t, i) => { slotOf[t] = SLOTS[i]; });

  const setToPattern = (set: ShapeType[]): Pattern => ({
    shapes: set.map((t) => ({ type: t, size: 'small' as Size, color, rotation: 0, position: slotOf[t] })),
  });
  const key = (s: ShapeType[]) => [...s].sort().join(',');

  const combine = (a: ShapeType[], b: ShapeType[]): ShapeType[] =>
    subtract ? a.filter((t) => !b.includes(t)) : universe.filter((t) => a.includes(t) || b.includes(t));

  const buildRow = (): { a: ShapeType[]; b: ShapeType[]; c: ShapeType[] } => {
    let guard = 0;
    while (guard++ < 40) {
      const a = universe.filter(() => chance(0.6));
      const b = universe.filter(() => chance(0.6));
      const c = combine(a, b);
      if (c.length > 0 && (a.length > 0 || b.length > 0)) return { a, b, c };
    }
    return { a: [universe[0]], b: [universe[1]], c: combine([universe[0]], [universe[1]]) };
  };

  const rows = [buildRow(), buildRow(), buildRow()];
  const cells: Pattern[][] = rows.map((row) => [setToPattern(row.a), setToPattern(row.b), setToPattern(row.c)]);
  const answerSet = rows[2].c;

  const seen = new Set<string>([key(answerSet)]);
  const distractors: Pattern[] = [];
  const add = (s: ShapeType[]) => {
    const k = key(s);
    if (distractors.length < 5 && !seen.has(k)) { seen.add(k); distractors.push(setToPattern(s)); }
  };

  // Plausible wrong reasoning: the other row cells, and the opposite operation.
  add(rows[2].a);
  add(rows[2].b);
  add(universe.filter((t) => rows[2].a.includes(t) || rows[2].b.includes(t))); // union (wrong if subtracting)
  add(universe.filter((t) => rows[2].a.includes(t) && rows[2].b.includes(t))); // intersection

  const allSubsets: ShapeType[][] = [];
  for (let m = 0; m < (1 << universe.length); m++) {
    allSubsets.push(universe.filter((_, i) => (m & (1 << i)) !== 0));
  }
  shuffle(allSubsets).forEach((s) => add(s));

  return { cells, answer: setToPattern(answerSet), distractors };
}

// ------------------------ compound: figure inside figure -------------------
// Classic "figura dentro de figura" — an outer outline frame + an inner shape,
// each varying by its own rule. This is what the hard Raven/ICAR items look
// like, and it adds real visual depth beyond single-shape cells.

const OUTER_TYPES: ShapeType[] = ['square', 'circle', 'diamond', 'triangle'];
const INNER_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'star', 'cross', 'diamond'];
type CAttr = 'outer' | 'inner' | 'innerFill';

interface CompoundSpec {
  outer: ShapeType;
  inner: ShapeType;
  innerFill: FillStyle;
}

const compoundToPattern = (s: CompoundSpec): Pattern => ({
  shapes: [
    { type: s.outer, size: 'large', color: 'black', fill: 'hollow', rotation: 0, position: { x: 0.5, y: 0.5 } },
    { type: s.inner, size: 'small', color: 'black', fill: s.innerFill, rotation: 0, position: { x: 0.5, y: 0.5 } },
  ],
});

const compoundKey = (s: CompoundSpec) => `${s.outer}|${s.inner}|${s.innerFill}`;

const applyC = (s: CompoundSpec, a: CAttr, v: ShapeType | FillStyle) => {
  if (a === 'outer') s.outer = v as ShapeType;
  else if (a === 'inner') s.inner = v as ShapeType;
  else s.innerFill = v as FillStyle;
};

const cPool = (a: CAttr): (ShapeType | FillStyle)[] =>
  a === 'outer' ? pickK(OUTER_TYPES, 3) : a === 'inner' ? pickK(INNER_TYPES, 3) : pickK(FILLS, 3);

function buildCompoundMode(): Built {
  const attrs = pickK(['outer', 'inner', 'innerFill'] as CAttr[], chance(0.5) ? 3 : 2);
  const base: CompoundSpec = { outer: pick(OUTER_TYPES), inner: pick(INNER_TYPES), innerFill: 'solid' };
  const plans = attrs.map((a) => ({ a, rule: pick(['progression', 'dist3', 'constant'] as Rule[]), values: cPool(a) }));

  const specAt = (r: number, c: number): CompoundSpec => {
    const s = { ...base };
    plans.forEach((pl) => applyC(s, pl.a, pl.values[idxFor(pl.rule, r, c, pl.values.length)]));
    return s;
  };
  const cellSpecs: CompoundSpec[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => specAt(r, c)));
  const answer = cellSpecs[2][2];

  const seen = new Set<string>([compoundKey(answer)]);
  const distractors: CompoundSpec[] = [];
  const add = (s: CompoundSpec) => {
    const k = compoundKey(s);
    if (distractors.length < 5 && !seen.has(k)) { seen.add(k); distractors.push(s); }
  };
  plans.forEach((pl) => {
    const wrong = pl.values.filter((v) => { const p = { ...answer }; applyC(p, pl.a, v); return compoundKey(p) !== compoundKey(answer); });
    if (wrong.length) { const d = { ...answer }; applyC(d, pl.a, pick(wrong)); add(d); }
  });
  let guard = 0;
  while (distractors.length < 5 && guard++ < 120) {
    const d = { ...answer };
    const a = pick(['outer', 'inner', 'innerFill'] as CAttr[]);
    applyC(d, a, a === 'outer' ? pick(OUTER_TYPES) : a === 'inner' ? pick(INNER_TYPES) : pick(FILLS));
    add(d);
  }
  return {
    cells: cellSpecs.map((row) => row.map(compoundToPattern)),
    answer: compoundToPattern(answer),
    distractors: distractors.map(compoundToPattern),
  };
}

// --------------------------------- assembly --------------------------------

function buildForLevel(level: Level): Built {
  switch (level) {
    case 1: return buildAttributeMode(1, ['constant', 'progression'], false);
    case 2: return buildAttributeMode(1, ['progression', 'dist3'], false);
    case 3: return chance(0.3) ? buildCompoundMode() : buildAttributeMode(2, ['progression', 'dist3'], false);
    case 4: {
      const r = Math.random();
      if (r < 0.35) return buildCompoundMode();
      return chance(0.5) ? buildAttributeMode(2, ['progression', 'dist3'], true) : buildDist2Mode();
    }
    case 5: {
      const r = Math.random();
      if (r < 0.32) return buildCompoundMode();
      if (r < 0.7) return buildAttributeMode(3, ['progression', 'dist3', 'constant'], true);
      return r < 0.85 ? buildDist2Mode() : buildAdditionMode(false);
    }
    case 6: {
      const r = Math.random();
      if (r < 0.3) return buildCompoundMode();
      if (r < 0.55) return buildAttributeMode(3, ['progression', 'dist3', 'constant'], true);
      if (r < 0.8) return buildAdditionMode(chance(0.5));
      return buildDist2Mode();
    }
    default: return buildAttributeMode(1, ['progression'], false);
  }
}

export const generatePuzzle = (level: Level): Puzzle => {
  const built = buildForLevel(level);
  const answerK = patternKey(built.answer);

  // never let a distractor collide with the answer, then take up to 5.
  const distractors = built.distractors.filter((p) => patternKey(p) !== answerK).slice(0, 5);
  const optionPatterns = shuffle([built.answer, ...distractors]);

  const matrix: (Pattern | null)[][] = built.cells.map((row, r) =>
    row.map((p, c) => (r === 2 && c === 2 ? null : p)),
  );
  const correctAnswer = optionPatterns.findIndex((p) => patternKey(p) === answerK);

  return { matrix, options: optionPatterns, correctAnswer };
};
