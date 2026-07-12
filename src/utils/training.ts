// Store local-first do treino cognitivo (streak, Índice de Treino, histórico,
// hábitos). É o "app score", NÃO o QI clínico (compliance: vender evolução da
// habilidade/hábito, nunca "seu QI real subiu"). Persistido em localStorage.

const KEY = 'qimind-training-v1';

export interface HabitLog {
  date: string; // YYYY-MM-DD
  aerobic: boolean;
  sleep: boolean;
  skill: boolean;
}

export interface HistoryPoint {
  date: string;
  index: number;
}

export interface TrainingData {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD do último treino
  index: number; // Índice de Treino (base 100, sobe com o treino)
  bestByExercise: Record<string, number>; // 0..100 por exercício
  history: HistoryPoint[]; // curva de evolução do índice
  habits: HabitLog[]; // log por dia
  todayDone: string[]; // exercícios feitos hoje
  todayKey: string; // dia de referência do todayDone
  watched: string[]; // IDs de vídeo assistidos (desbloqueia a jornada)
}

const DEFAULT: TrainingData = {
  streak: 0,
  lastActiveDate: '',
  index: 100,
  bestByExercise: {},
  history: [],
  habits: [],
  todayDone: [],
  todayKey: '',
  watched: [],
};

export const todayStr = (): string => new Date().toISOString().slice(0, 10);

const daysBetween = (a: string, b: string): number => {
  if (!a || !b) return Infinity;
  const ms = new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime();
  return Math.round(ms / 86400000);
};

export function loadTraining(): TrainingData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const d = { ...DEFAULT, ...(JSON.parse(raw) as Partial<TrainingData>) };
    // Zera os exercícios do dia se virou o dia.
    if (d.todayKey !== todayStr()) {
      d.todayDone = [];
      d.todayKey = todayStr();
    }
    return d;
  } catch {
    return { ...DEFAULT };
  }
}

function save(d: TrainingData): TrainingData {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* ignora quota */
  }
  return d;
}

// Atualiza o streak com base na última atividade (hoje conta 1x).
function bumpStreak(d: TrainingData): void {
  const today = todayStr();
  if (d.lastActiveDate === today) return; // já contou hoje
  const gap = daysBetween(d.lastActiveDate, today);
  d.streak = gap === 1 ? d.streak + 1 : 1; // dia seguinte soma; buraco reinicia
  d.lastActiveDate = today;
}

function recomputeIndex(d: TrainingData): void {
  const scores = Object.values(d.bestByExercise);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  // base 100 + até ~30 por performance + bônus de consistência (cap 10).
  d.index = 100 + Math.round((avg / 100) * 30) + Math.min(10, d.streak);
}

function pushHistory(d: TrainingData): void {
  const today = todayStr();
  const last = d.history[d.history.length - 1];
  if (last && last.date === today) last.index = d.index;
  else d.history.push({ date: today, index: d.index });
  if (d.history.length > 60) d.history = d.history.slice(-60);
}

// Registra o resultado de um exercício (score 0..100).
export function recordExercise(key: string, score: number): TrainingData {
  const d = loadTraining();
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  d.bestByExercise[key] = Math.max(d.bestByExercise[key] ?? 0, clamped);
  if (!d.todayDone.includes(key)) d.todayDone.push(key);
  d.todayKey = todayStr();
  bumpStreak(d);
  recomputeIndex(d);
  pushHistory(d);
  return save(d);
}

// Marca/desmarca um hábito do dia (aerobic | sleep | skill).
export function toggleHabit(kind: 'aerobic' | 'sleep' | 'skill'): TrainingData {
  const d = loadTraining();
  const today = todayStr();
  let log = d.habits.find((h) => h.date === today);
  if (!log) {
    log = { date: today, aerobic: false, sleep: false, skill: false };
    d.habits.push(log);
  }
  log[kind] = !log[kind];
  if (d.habits.length > 60) d.habits = d.habits.slice(-60);
  // Hábito também conta como atividade do dia (mantém o streak vivo).
  if (log.aerobic || log.sleep || log.skill) {
    bumpStreak(d);
    pushHistory(d);
  }
  return save(d);
}

// Marca um vídeo como assistido (avança a jornada + conta como atividade do dia).
export function markWatched(yt: string): TrainingData {
  const d = loadTraining();
  if (!d.watched.includes(yt)) d.watched.push(yt);
  bumpStreak(d);
  pushHistory(d);
  return save(d);
}

export function todayHabits(d: TrainingData): HabitLog {
  const today = todayStr();
  return d.habits.find((h) => h.date === today) ?? { date: today, aerobic: false, sleep: false, skill: false };
}
