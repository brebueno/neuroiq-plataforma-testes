// Small random helpers shared by the puzzle engine.
// Kept dependency-free and centralized so every generator draws variety the
// same way — and so we can swap in a seeded PRNG later without touching callers.

export const randInt = (n: number): number => Math.floor(Math.random() * n);

export const pick = <T>(arr: T[]): T => arr[randInt(arr.length)];

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const pickK = <T>(arr: T[], k: number): T[] => shuffle(arr).slice(0, k);

export const chance = (p: number): boolean => Math.random() < p;
