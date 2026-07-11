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

// Item difficulty (b) on a logit scale, by level. Calibrated so an average
// test-taker (ability θ=0, i.e. IQ 100) has the intended chance of a correct
// answer: L1 ≈ 90%, L2 ≈ 80%, L3 ≈ 65%, L4 ≈ 50%, L5 ≈ 33%, L6 ≈ 20%.
const ITEM_DIFFICULTY: Record<Level, number> = {
  1: -2.2,
  2: -1.4,
  3: -0.6,
  4: 0.0,
  5: 0.7,
  6: 1.4,
};

/**
 * Overall IQ from the actual per-question results — norm-referenced, not an
 * arbitrary curve.
 *
 * Uses a 1-parameter IRT (Rasch) model: P(correct) = 1 / (1 + e^-(θ - b)),
 * where b is the item difficulty and θ the person's latent ability. We estimate
 * θ by maximum a-posteriori (grid search + a weak N(0,1.6) prior so a perfect or
 * empty run doesn't diverge), then map ability to the standard IQ scale
 * (mean 100, SD 15): IQ = 100 + 15·θ. Because each item contributes according
 * to its difficulty, a heterogeneous mix of question types produces a stable,
 * comparable score.
 */
export function calculateIQFromResults(results: { level: Level; correct: boolean }[]): number {
  if (results.length === 0) return 100;

  const bs = results.map((r) => ITEM_DIFFICULTY[r.level] ?? 0);
  const xs = results.map((r) => (r.correct ? 1 : 0));

  const prob = (theta: number, b: number) => 1 / (1 + Math.exp(-(theta - b)));
  const PRIOR_SD = 1.6;

  const logPosterior = (theta: number): number => {
    let ll = 0;
    for (let i = 0; i < bs.length; i++) {
      const p = Math.min(1 - 1e-6, Math.max(1e-6, prob(theta, bs[i])));
      ll += xs[i] ? Math.log(p) : Math.log(1 - p);
    }
    ll += -(theta * theta) / (2 * PRIOR_SD * PRIOR_SD); // weak prior, shrinks extremes
    return ll;
  };

  let bestLL = -Infinity;
  let bestTheta = 0;
  for (let t = -3.5; t <= 3.5; t += 0.02) {
    const ll = logPosterior(t);
    if (ll > bestLL) { bestLL = ll; bestTheta = t; }
  }

  const iq = 100 + 15 * bestTheta;
  return Math.max(55, Math.min(155, Math.round(iq)));
}

export function getIQClassification(iq: number): string {
  if (iq >= 145) return 'Gênio';
  if (iq >= 130) return 'Muito superior';
  if (iq >= 120) return 'Superior';
  if (iq >= 110) return 'Acima da média';
  if (iq >= 90) return 'Média';
  if (iq >= 80) return 'Abaixo da média';
  if (iq >= 70) return 'Limítrofe';
  return 'Baixa';
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
