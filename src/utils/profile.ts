// Perfil do teste de QI persistido pra personalizar a entrada na plataforma
// (onboarding). O teste mede tipos de raciocínio; aqui traduzimos o ponto mais
// fraco num plano de treino (exercício recomendado + trilha). É "app plan",
// não laudo clínico. Persistido em localStorage.

export type ExKey = 'math' | 'span' | 'nback';

export interface TypeScore {
  type: string;
  label: string;
  pct: number;
}

export interface TestProfile {
  iq: number;
  percentile: number;
  classification: string;
  byType: TypeScore[];
  date: string; // YYYY-MM-DD
}

const KEY = 'qimind-test-profile-v1';

// Cada tipo de raciocínio aponta pro exercício que mais o treina + como falamos dele.
const FOCUS: Record<string, { ex: ExKey; area: string }> = {
  matrix: { ex: 'nback', area: 'raciocínio abstrato' },
  series: { ex: 'math', area: 'raciocínio sequencial' },
  oddone: { ex: 'nback', area: 'atenção e discriminação' },
  analogy: { ex: 'nback', area: 'raciocínio relacional' },
  'verbal-analogy': { ex: 'span', area: 'associação verbal' },
  'verbal-oddone': { ex: 'span', area: 'discriminação verbal' },
};

export function saveTestProfile(p: Omit<TestProfile, 'date'>): void {
  try {
    const date = new Date().toISOString().slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify({ ...p, date }));
  } catch {
    /* ignora quota */
  }
}

export function loadTestProfile(): TestProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TestProfile;
  } catch {
    return null;
  }
}

export interface FocusPlan {
  strongest: TypeScore;
  weakest: TypeScore;
  ex: ExKey; // exercício recomendado pra fortalecer o ponto fraco
  area: string; // área a fortalecer, em linguagem simples
}

// Deriva o plano: ponto forte, ponto a fortalecer e o exercício que ataca ele.
export function deriveFocus(p: TestProfile): FocusPlan | null {
  const items = (p.byType ?? []).filter((t) => typeof t.pct === 'number');
  if (items.length < 2) return null;
  const sorted = [...items].sort((a, b) => b.pct - a.pct);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const f = FOCUS[weakest.type] ?? { ex: 'math' as ExKey, area: 'raciocínio geral' };
  return { strongest, weakest, ex: f.ex, area: f.area };
}
