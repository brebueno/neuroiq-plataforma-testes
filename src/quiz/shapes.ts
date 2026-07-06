import { Pattern, Shape } from '../types/game';

// Shared helpers for building figural patterns (reused by odd-one-out, analogy
// and any figural question type). Renders through the existing PatternDisplay.

export type ShapeType = Shape['type'];
export type Size = Shape['size'];
export type Color = Shape['color'];

export const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star'];
export const SIZES: Size[] = ['small', 'medium', 'large'];
export const COLORS: Color[] = ['black', 'gray', 'white'];
export const ROTATIONS = [0, 45, 90, 135];

const positionsFor = (count: number): { x: number; y: number }[] => {
  switch (count) {
    case 0: return [];
    case 1: return [{ x: 0.5, y: 0.5 }];
    case 2: return [{ x: 0.34, y: 0.5 }, { x: 0.66, y: 0.5 }];
    case 3: return [{ x: 0.3, y: 0.34 }, { x: 0.5, y: 0.66 }, { x: 0.7, y: 0.34 }];
    case 4: return [{ x: 0.32, y: 0.32 }, { x: 0.68, y: 0.32 }, { x: 0.32, y: 0.68 }, { x: 0.68, y: 0.68 }];
    default: return [{ x: 0.5, y: 0.5 }];
  }
};

export interface Spec {
  type: ShapeType;
  size?: Size;
  color?: Color;
  rotation?: number;
  count?: number;
}

// One cell = `count` copies of the same shape, laid out without overlap.
export function cell(s: Spec): Pattern {
  const count = s.count ?? 1;
  return {
    shapes: positionsFor(count).map((p) => ({
      type: s.type,
      size: s.size ?? 'medium',
      color: s.color ?? 'black',
      rotation: s.rotation ?? 0,
      position: p,
    })),
  };
}

export const specKey = (s: Spec) =>
  `${s.type}|${s.size ?? 'medium'}|${s.color ?? 'black'}|${s.rotation ?? 0}|${s.count ?? 1}`;
