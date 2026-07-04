// Big Five (Five Factor Model) — items from the International Personality Item
// Pool (IPIP), which is PUBLIC DOMAIN (free to use, modify, and sell).
// Source pool: https://ipip.ori.org  (IPIP Big-Five Factor Markers)
// Translated to pt-BR. Each item is keyed to the POSITIVE pole of its trait;
// `reverse: true` means agreement LOWERS the score.

export interface LikertItem {
  text: string;
  dim: string;
  reverse?: boolean;
}

export interface DimensionScore {
  key: string;
  label: string;
  pct: number;
  desc: string;
}

export const bigFiveItems: LikertItem[] = [
  // Extroversão (E)
  { text: 'Sou a alma da festa.', dim: 'E' },
  { text: 'Falo pouco.', dim: 'E', reverse: true },
  { text: 'Me sinto à vontade perto das pessoas.', dim: 'E' },
  { text: 'Prefiro ficar em segundo plano.', dim: 'E', reverse: true },
  { text: 'Começo conversas com facilidade.', dim: 'E' },
  { text: 'Tenho pouco a dizer.', dim: 'E', reverse: true },
  // Amabilidade (A)
  { text: 'Me importo pouco com os outros.', dim: 'A', reverse: true },
  { text: 'Me interesso pelas pessoas.', dim: 'A' },
  { text: 'Sinto empatia pelos sentimentos dos outros.', dim: 'A' },
  { text: 'Não me interesso muito pelos outros.', dim: 'A', reverse: true },
  { text: 'Tiro um tempo para os outros.', dim: 'A' },
  { text: 'Deixo as pessoas à vontade.', dim: 'A' },
  // Conscienciosidade (C)
  { text: 'Estou sempre preparado.', dim: 'C' },
  { text: 'Deixo minhas coisas espalhadas.', dim: 'C', reverse: true },
  { text: 'Presto atenção aos detalhes.', dim: 'C' },
  { text: 'Faço bagunça com as coisas.', dim: 'C', reverse: true },
  { text: 'Cumpro minhas tarefas logo.', dim: 'C' },
  { text: 'Costumo esquecer de colocar as coisas no lugar.', dim: 'C', reverse: true },
  // Estabilidade emocional (ES)
  { text: 'Fico estressado com facilidade.', dim: 'ES', reverse: true },
  { text: 'Fico relaxado na maior parte do tempo.', dim: 'ES' },
  { text: 'Me preocupo muito com as coisas.', dim: 'ES', reverse: true },
  { text: 'Fico chateado facilmente.', dim: 'ES', reverse: true },
  { text: 'Mudo muito de humor.', dim: 'ES', reverse: true },
  { text: 'Raramente fico pra baixo.', dim: 'ES' },
  // Abertura (O)
  { text: 'Tenho um vocabulário rico.', dim: 'O' },
  { text: 'Tenho dificuldade com ideias abstratas.', dim: 'O', reverse: true },
  { text: 'Tenho uma imaginação vívida.', dim: 'O' },
  { text: 'Tenho ótimas ideias.', dim: 'O' },
  { text: 'Não tenho boa imaginação.', dim: 'O', reverse: true },
  { text: 'Entendo as coisas rapidamente.', dim: 'O' },
];

const LABELS: Record<string, string> = {
  O: 'Abertura',
  C: 'Conscienciosidade',
  E: 'Extroversão',
  A: 'Amabilidade',
  ES: 'Estabilidade emocional',
};

const DESC: Record<string, string> = {
  O: 'Curioso, criativo e aberto a novas ideias.',
  C: 'Organizado, disciplinado e confiável.',
  E: 'Sociável, comunicativo e cheio de energia.',
  A: 'Empático, cooperativo e gentil.',
  ES: 'Calmo, equilibrado e resiliente ao estresse.',
};

export function scoreBigFive(answers: number[]): { dims: DimensionScore[]; headline: string } {
  const acc: Record<string, { sum: number; count: number }> = {};
  bigFiveItems.forEach((item, i) => {
    const a = answers[i] ?? 3;
    const val = item.reverse ? 6 - a : a;
    if (!acc[item.dim]) acc[item.dim] = { sum: 0, count: 0 };
    acc[item.dim].sum += val;
    acc[item.dim].count += 1;
  });

  const order = ['O', 'C', 'E', 'A', 'ES'];
  const dims: DimensionScore[] = order.map((k) => {
    const { sum, count } = acc[k];
    // items are 1..5, so (sum - count) / (count*4) maps to 0..1
    const pct = Math.round(((sum - count) / (count * 4)) * 100);
    return { key: k, label: LABELS[k], pct: Math.max(0, Math.min(100, pct)), desc: DESC[k] };
  });

  const top = [...dims].sort((a, b) => b.pct - a.pct)[0];
  return { dims, headline: top.label };
}
