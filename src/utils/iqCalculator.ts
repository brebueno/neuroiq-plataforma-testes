import { Level } from '../types/game';

// Per-question IQ shown after each answer (rough feedback, by difficulty).
const QUESTION_IQ: Record<Level, number> = {
  1: 95,
  2: 105,
  3: 115,
  4: 125,
  5: 135,
  6: 145,
};

export function calculateQuestionIQ(level: Level, correct: boolean): number {
  if (correct) return QUESTION_IQ[level];
  return Math.max(65, 72 + level * 2);
}

/**
 * Overall IQ from the actual per-question results.
 * Each question is worth points equal to its difficulty level (1..6), so
 * getting HARD questions right matters far more than easy ones. The weighted
 * ratio is mapped onto a realistic IQ range (~60 up to ~150) with a mild
 * curve so a "got the easy ones" run lands near the average of 100.
 */
export function calculateIQFromResults(results: { level: Level; correct: boolean }[]): number {
  if (results.length === 0) return 100;

  const maxPoints = results.reduce((sum, r) => sum + r.level, 0);
  const earned = results.reduce((sum, r) => sum + (r.correct ? r.level : 0), 0);
  const raw = maxPoints > 0 ? earned / maxPoints : 0;

  // 0 -> 60, ~0.3 -> ~96, 0.5 -> ~113, 1 -> 150
  const iq = 60 + Math.pow(raw, 0.75) * 90;
  return Math.max(55, Math.min(155, Math.round(iq)));
}

export function getIQClassification(iq: number): string {
  if (iq >= 145) return 'Genius';
  if (iq >= 130) return 'Very Superior';
  if (iq >= 120) return 'Superior';
  if (iq >= 110) return 'High Average';
  if (iq >= 90) return 'Average';
  if (iq >= 80) return 'Low Average';
  if (iq >= 70) return 'Borderline';
  return 'Below Average';
}

export function getIQPercentile(iq: number): number {
  // Normal distribution, mean 100, SD 15
  const z = (iq - 100) / 15;
  const percentile = 0.5 * (1 + erf(z / Math.sqrt(2)));
  return Math.max(1, Math.min(99, Math.round(percentile * 100)));
}

// Abramowitz & Stegun error-function approximation
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}
