// RIASEC / Holland Codes, interesses vocacionais. Banco ampliado para 60 itens
// (10 por escala) escritos em pt-BR natural. A cada sessão sorteamos um
// subconjunto equilibrado (ver sampleRiasec), então refazer o teste não repete
// as mesmas perguntas, mantendo 6 escalas sempre equilibradas.

import { LikertItem, DimensionScore } from './bigFive';

export const riasecPool: LikertItem[] = [
  // Realista (R)
  { text: 'Consertar aparelhos eletrônicos.', dim: 'R' },
  { text: 'Trabalhar com ferramentas e máquinas.', dim: 'R' },
  { text: 'Montar móveis ou objetos.', dim: 'R' },
  { text: 'Trabalhar ao ar livre.', dim: 'R' },
  { text: 'Consertar um carro.', dim: 'R' },
  { text: 'Construir coisas com as mãos.', dim: 'R' },
  { text: 'Operar uma máquina em uma fábrica.', dim: 'R' },
  { text: 'Cuidar de animais ou plantações.', dim: 'R' },
  { text: 'Instalar sistemas elétricos ou hidráulicos.', dim: 'R' },
  { text: 'Praticar esportes ou atividades físicas exigentes.', dim: 'R' },
  // Investigativo (I)
  { text: 'Resolver problemas de matemática.', dim: 'I' },
  { text: 'Fazer experimentos científicos.', dim: 'I' },
  { text: 'Estudar como as coisas funcionam.', dim: 'I' },
  { text: 'Pesquisar um assunto a fundo.', dim: 'I' },
  { text: 'Analisar dados e números.', dim: 'I' },
  { text: 'Entender teorias complexas.', dim: 'I' },
  { text: 'Investigar a causa de um problema difícil.', dim: 'I' },
  { text: 'Ler sobre ciência e novas descobertas.', dim: 'I' },
  { text: 'Programar ou desenvolver software.', dim: 'I' },
  { text: 'Fazer diagnósticos e testes de laboratório.', dim: 'I' },
  // Artístico (A)
  { text: 'Desenhar, pintar ou criar arte.', dim: 'A' },
  { text: 'Escrever histórias ou poesia.', dim: 'A' },
  { text: 'Tocar um instrumento musical.', dim: 'A' },
  { text: 'Criar designs ou decorações.', dim: 'A' },
  { text: 'Atuar ou fazer teatro.', dim: 'A' },
  { text: 'Inventar coisas novas e originais.', dim: 'A' },
  { text: 'Fotografar ou editar vídeos.', dim: 'A' },
  { text: 'Compor músicas ou letras.', dim: 'A' },
  { text: 'Decorar ambientes ou criar looks.', dim: 'A' },
  { text: 'Criar conteúdo criativo para as redes sociais.', dim: 'A' },
  // Social (S)
  { text: 'Ajudar pessoas com problemas.', dim: 'S' },
  { text: 'Ensinar ou treinar alguém.', dim: 'S' },
  { text: 'Cuidar do bem-estar dos outros.', dim: 'S' },
  { text: 'Trabalhar em equipe.', dim: 'S' },
  { text: 'Ouvir e aconselhar amigos.', dim: 'S' },
  { text: 'Fazer trabalho voluntário.', dim: 'S' },
  { text: 'Cuidar de crianças ou idosos.', dim: 'S' },
  { text: 'Mediar conflitos entre pessoas.', dim: 'S' },
  { text: 'Atender e orientar clientes ou pacientes.', dim: 'S' },
  { text: 'Organizar ações comunitárias.', dim: 'S' },
  // Empreendedor (E)
  { text: 'Liderar um grupo ou projeto.', dim: 'E' },
  { text: 'Vender produtos ou ideias.', dim: 'E' },
  { text: 'Convencer pessoas de algo.', dim: 'E' },
  { text: 'Começar meu próprio negócio.', dim: 'E' },
  { text: 'Tomar decisões importantes.', dim: 'E' },
  { text: 'Falar em público.', dim: 'E' },
  { text: 'Negociar um acordo ou contrato.', dim: 'E' },
  { text: 'Gerenciar uma equipe.', dim: 'E' },
  { text: 'Lançar um produto no mercado.', dim: 'E' },
  { text: 'Assumir riscos por uma grande oportunidade.', dim: 'E' },
  // Convencional (C)
  { text: 'Organizar arquivos e documentos.', dim: 'C' },
  { text: 'Trabalhar com planilhas e números.', dim: 'C' },
  { text: 'Seguir rotinas e procedimentos.', dim: 'C' },
  { text: 'Cuidar de contas e orçamentos.', dim: 'C' },
  { text: 'Manter tudo organizado.', dim: 'C' },
  { text: 'Fazer tarefas detalhadas e precisas.', dim: 'C' },
  { text: 'Conferir dados em busca de erros.', dim: 'C' },
  { text: 'Controlar estoque ou inventário.', dim: 'C' },
  { text: 'Seguir um passo a passo com precisão.', dim: 'C' },
  { text: 'Cuidar de documentos e prazos.', dim: 'C' },
];

const LABELS: Record<string, string> = {
  R: 'Realista',
  I: 'Investigativo',
  A: 'Artístico',
  S: 'Social',
  E: 'Empreendedor',
  C: 'Convencional',
};

const DESC: Record<string, string> = {
  R: 'Gosta de atividades práticas, mão na massa e trabalho com objetos e máquinas.',
  I: 'Gosta de investigar, analisar e resolver problemas com raciocínio.',
  A: 'Gosta de criar, expressar-se e trabalhar com originalidade.',
  S: 'Gosta de ajudar, ensinar e cuidar das pessoas.',
  E: 'Gosta de liderar, persuadir e tocar projetos e negócios.',
  C: 'Gosta de organizar, seguir processos e trabalhar com precisão.',
};

const COLORS: Record<string, string> = {
  R: '#64748B',
  I: '#3B82F6',
  A: '#EC4899',
  S: '#10B981',
  E: '#F59E0B',
  C: '#14B8A6',
};

const noteFor = (key: string, pct: number): string =>
  pct >= 50 ? DESC[key] : `Menos interesse por atividades ${LABELS[key].toLowerCase()}s no momento.`;

// pt-BR careers tagged with a 1–2 letter Holland code. Match = média dos
// interesses do usuário nas letras do código, então cada carreira puxa das
// dimensões certas.
const CAREERS_LIST: [string, string][] = [
  ['Engenharia', 'RI'], ['Programação e software', 'IR'], ['Ciência de dados', 'IC'],
  ['Medicina', 'IS'], ['Enfermagem', 'SR'], ['Psicologia', 'SI'], ['Nutrição', 'SI'],
  ['Fisioterapia', 'SR'], ['Professor / Educação', 'SA'], ['Recursos Humanos', 'SE'],
  ['Design gráfico', 'AE'], ['Arquitetura', 'AR'], ['Publicidade e marketing', 'AE'],
  ['Jornalismo', 'AS'], ['Música e artes', 'A'], ['Gastronomia', 'AR'],
  ['Direito', 'ES'], ['Administração', 'EC'], ['Empreendedorismo', 'ER'], ['Vendas', 'EC'],
  ['Contabilidade', 'CE'], ['Finanças', 'CI'], ['Logística', 'CR'], ['Veterinária', 'IR'],
];

export interface CareerMatch {
  name: string;
  match: number;
}

const SCALES = ['R', 'I', 'A', 'S', 'E', 'C'];

const shuffle = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * Sorteia `perScale` itens de cada uma das 6 escalas RIASEC (padrão 6 → 36
 * itens). Como cada escala contribui igualmente, o perfil fica sempre
 * equilibrado, e refazer o teste traz outro subconjunto.
 */
export function sampleRiasec(perScale = 6): LikertItem[] {
  const byScale: Record<string, LikertItem[]> = {};
  riasecPool.forEach((it) => {
    (byScale[it.dim] ||= []).push(it);
  });
  const picked: LikertItem[] = [];
  SCALES.forEach((s) => {
    picked.push(...shuffle(byScale[s] ?? []).slice(0, perScale));
  });
  return shuffle(picked);
}

/** Pontua o conjunto de itens respondido, gera o código Holland e as carreiras. */
export function scoreRiasec(
  answers: number[],
  items: LikertItem[] = riasecPool,
): { dims: DimensionScore[]; headline: string; careers: CareerMatch[] } {
  const acc: Record<string, { sum: number; count: number }> = {};
  items.forEach((item, i) => {
    const a = answers[i] ?? 3;
    const val = item.reverse ? 6 - a : a;
    (acc[item.dim] ||= { sum: 0, count: 0 });
    acc[item.dim].sum += val;
    acc[item.dim].count += 1;
  });

  const pctByKey: Record<string, number> = {};
  const dims: DimensionScore[] = SCALES.map((k) => {
    const { sum, count } = acc[k] ?? { sum: 0, count: 1 };
    const pct = Math.max(0, Math.min(100, Math.round(((sum - count) / (count * 4)) * 100)));
    pctByKey[k] = pct;
    return { key: k, label: LABELS[k], pct, desc: DESC[k], color: COLORS[k], note: noteFor(k, pct) };
  });

  const top3 = [...dims].sort((a, b) => b.pct - a.pct).slice(0, 3);
  const headline = top3.map((d) => d.key).join('');

  const careers: CareerMatch[] = CAREERS_LIST.map(([name, code]) => {
    const letters = code.split('');
    const match = Math.round(letters.reduce((s, l) => s + (pctByKey[l] ?? 0), 0) / letters.length);
    return { name, match };
  })
    .sort((a, b) => b.match - a.match)
    .slice(0, 8);

  return { dims, headline, careers };
}
