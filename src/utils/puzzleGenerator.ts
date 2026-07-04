import { Level, Puzzle, Pattern, Shape } from '../types/game';

// Parametric Raven's-Progressive-Matrices generator.
// Instead of a handful of hard-coded puzzles, each cell of the 3x3 matrix is
// derived from transformation RULES applied across rows/columns. This produces
// virtually unlimited, non-repeating puzzles and lets difficulty scale by the
// NUMBER of attributes changing at once.

type ShapeType = Shape['type'];
type Size = Shape['size'];
type Color = Shape['color'];
type Dim = 'size' | 'count' | 'color' | 'rotation' | 'type';

const ALL_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star'];
// rotation is only visible on non-symmetric shapes
const ASYMMETRIC_TYPES: ShapeType[] = ['triangle', 'diamond', 'cross', 'star'];
const SIZES: Size[] = ['small', 'medium', 'large'];
const COLORS: Color[] = ['black', 'gray', 'white'];
const ROTATIONS = [0, 45, 90, 135];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]): T => arr[rand(arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pickK = <T,>(arr: T[], k: number): T[] => shuffle(arr).slice(0, k);

interface CellSpec {
  type: ShapeType;
  size: Size;
  color: Color;
  rotation: number;
  count: number;
}

// where to place N shapes inside one cell without overlapping
const positionsFor = (count: number): { x: number; y: number }[] => {
  switch (count) {
    case 1: return [{ x: 0.5, y: 0.5 }];
    case 2: return [{ x: 0.34, y: 0.5 }, { x: 0.66, y: 0.5 }];
    case 3: return [{ x: 0.3, y: 0.34 }, { x: 0.5, y: 0.66 }, { x: 0.7, y: 0.34 }];
    default: return [{ x: 0.5, y: 0.5 }];
  }
};

const cellToPattern = (c: CellSpec): Pattern => ({
  shapes: positionsFor(c.count).map((p) => ({
    type: c.type,
    size: c.size,
    color: c.color,
    rotation: c.rotation,
    position: p,
  })),
});

const specKey = (c: CellSpec) => `${c.type}|${c.size}|${c.color}|${c.rotation}|${c.count}`;

// how many attributes vary + which are allowed, per difficulty level
const levelConfig = (level: Level): { numDims: number; pool: Dim[] } => {
  switch (level) {
    case 1: return { numDims: 1, pool: ['size', 'count'] };
    case 2: return { numDims: 1, pool: ['color', 'type', 'count'] };
    case 3: return { numDims: 2, pool: ['size', 'count', 'color', 'type'] };
    case 4: return { numDims: 2, pool: ['size', 'count', 'color', 'type', 'rotation'] };
    case 5: return { numDims: 3, pool: ['size', 'count', 'color', 'type', 'rotation'] };
    case 6: return { numDims: 3, pool: ['size', 'count', 'color', 'type', 'rotation'] };
    default: return { numDims: 1, pool: ['size'] };
  }
};

const applyDim = (c: CellSpec, dim: Dim, v: unknown) => {
  if (dim === 'size') c.size = v as Size;
  else if (dim === 'count') c.count = v as number;
  else if (dim === 'color') c.color = v as Color;
  else if (dim === 'rotation') c.rotation = v as number;
  else if (dim === 'type') c.type = v as ShapeType;
};

export const generatePuzzle = (level: Level, _puzzleIndex: number): Puzzle => {
  const cfg = levelConfig(level);
  let dims = pickK(cfg.pool, cfg.numDims);
  // size + count together get visually cramped — drop size if both picked
  if (dims.includes('size') && dims.includes('count')) {
    dims = dims.filter((d) => d !== 'size');
  }

  const rotationVaries = dims.includes('rotation');
  const countVaries = dims.includes('count');

  // fixed values for the attributes that do NOT vary
  const base: CellSpec = {
    type: rotationVaries ? pick(ASYMMETRIC_TYPES) : pick(ALL_TYPES),
    size: 'medium',
    color: pick(COLORS),
    rotation: 0,
    count: 1,
  };
  if (countVaries) base.size = 'small'; // keep multi-shape cells readable

  // build a value sequence + random phase offset for each varying attribute
  const seqs: Partial<Record<Dim, { values: unknown[]; offset: number }>> = {};
  dims.forEach((dim) => {
    let values: unknown[];
    switch (dim) {
      case 'size': values = [...SIZES]; break;
      case 'count': values = [1, 2, 3]; break;
      case 'color': values = shuffle([...COLORS]); break;
      case 'rotation': values = [...ROTATIONS]; break;
      case 'type': values = pickK(rotationVaries ? ASYMMETRIC_TYPES : ALL_TYPES, 3); break;
      default: values = [0];
    }
    seqs[dim] = { values, offset: rand(values.length) };
  });

  const specAt = (row: number, col: number): CellSpec => {
    const c: CellSpec = { ...base };
    dims.forEach((dim) => {
      const s = seqs[dim]!;
      const idx = (row + col + s.offset) % s.values.length;
      applyDim(c, dim, s.values[idx]);
    });
    return c;
  };

  // 3x3 matrix, bottom-right cell missing (index 8)
  const matrix: (Pattern | null)[][] = [];
  for (let r = 0; r < 3; r++) {
    const rowArr: (Pattern | null)[] = [];
    for (let col = 0; col < 3; col++) {
      rowArr.push(r === 2 && col === 2 ? null : cellToPattern(specAt(r, col)));
    }
    matrix.push(rowArr);
  }

  const answerSpec = specAt(2, 2);

  // build answer options: the correct cell + plausible distractors
  const usedKeys = new Set<string>([specKey(answerSpec)]);
  const distractors: CellSpec[] = [];
  const addDistractor = (d: CellSpec) => {
    const k = specKey(d);
    if (!usedKeys.has(k)) {
      usedKeys.add(k);
      distractors.push(d);
    }
  };

  // strongest distractors: correct on all but one varying attribute
  dims.forEach((dim) => {
    const s = seqs[dim]!;
    const wrong = s.values.filter((v) => {
      const probe: CellSpec = { ...answerSpec };
      applyDim(probe, dim, v);
      return specKey(probe) !== specKey(answerSpec);
    });
    if (wrong.length) {
      const d: CellSpec = { ...answerSpec };
      applyDim(d, dim, pick(wrong));
      addDistractor(d);
    }
  });

  // top up to 5 distractors with random perturbations
  let guard = 0;
  while (distractors.length < 5 && guard < 80) {
    guard++;
    const d: CellSpec = { ...answerSpec };
    const which = pick(dims);
    if (which === 'size') d.size = pick(SIZES);
    else if (which === 'count') d.count = 1 + rand(3);
    else if (which === 'color') d.color = pick(COLORS);
    else if (which === 'rotation') d.rotation = pick(ROTATIONS);
    else if (which === 'type') d.type = pick(rotationVaries ? ASYMMETRIC_TYPES : ALL_TYPES);
    addDistractor(d);
  }

  const optionSpecs = shuffle([answerSpec, ...distractors.slice(0, 5)]);
  const options = optionSpecs.map(cellToPattern);
  const correctAnswer = optionSpecs.findIndex((s) => specKey(s) === specKey(answerSpec));

  return { matrix, options, correctAnswer };
};
