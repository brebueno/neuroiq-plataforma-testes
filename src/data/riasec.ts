// RIASEC / Holland Codes — vocational interest items based on the Interest Item
// Pool (Liao, Armstrong & Rounds, 2008), created explicitly as a PUBLIC DOMAIN
// alternative to commercial career assessments. Free to use, modify, and sell.
// Translated / adapted to pt-BR. All items are positively keyed.

import { LikertItem, DimensionScore } from './bigFive';

export const riasecItems: LikertItem[] = [
  // Realista (R)
  { text: 'Consertar aparelhos eletrônicos.', dim: 'R' },
  { text: 'Trabalhar com ferramentas e máquinas.', dim: 'R' },
  { text: 'Montar móveis ou objetos.', dim: 'R' },
  { text: 'Trabalhar ao ar livre.', dim: 'R' },
  { text: 'Consertar um carro.', dim: 'R' },
  { text: 'Construir coisas com as mãos.', dim: 'R' },
  // Investigativo (I)
  { text: 'Resolver problemas de matemática.', dim: 'I' },
  { text: 'Fazer experimentos científicos.', dim: 'I' },
  { text: 'Estudar como as coisas funcionam.', dim: 'I' },
  { text: 'Pesquisar um assunto a fundo.', dim: 'I' },
  { text: 'Analisar dados e números.', dim: 'I' },
  { text: 'Entender teorias complexas.', dim: 'I' },
  // Artístico (A)
  { text: 'Desenhar, pintar ou criar arte.', dim: 'A' },
  { text: 'Escrever histórias ou poesia.', dim: 'A' },
  { text: 'Tocar um instrumento musical.', dim: 'A' },
  { text: 'Criar designs ou decorações.', dim: 'A' },
  { text: 'Atuar ou fazer teatro.', dim: 'A' },
  { text: 'Inventar coisas novas e originais.', dim: 'A' },
  // Social (S)
  { text: 'Ajudar pessoas com problemas.', dim: 'S' },
  { text: 'Ensinar ou treinar alguém.', dim: 'S' },
  { text: 'Cuidar do bem-estar dos outros.', dim: 'S' },
  { text: 'Trabalhar em equipe.', dim: 'S' },
  { text: 'Ouvir e aconselhar amigos.', dim: 'S' },
  { text: 'Fazer trabalho voluntário.', dim: 'S' },
  // Empreendedor (E)
  { text: 'Liderar um grupo ou projeto.', dim: 'E' },
  { text: 'Vender produtos ou ideias.', dim: 'E' },
  { text: 'Convencer pessoas de algo.', dim: 'E' },
  { text: 'Começar meu próprio negócio.', dim: 'E' },
  { text: 'Tomar decisões importantes.', dim: 'E' },
  { text: 'Falar em público.', dim: 'E' },
  // Convencional (C)
  { text: 'Organizar arquivos e documentos.', dim: 'C' },
  { text: 'Trabalhar com planilhas e números.', dim: 'C' },
  { text: 'Seguir rotinas e procedimentos.', dim: 'C' },
  { text: 'Cuidar de contas e orçamentos.', dim: 'C' },
  { text: 'Manter tudo organizado.', dim: 'C' },
  { text: 'Fazer tarefas detalhadas e precisas.', dim: 'C' },
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

const CAREERS: Record<string, string> = {
  R: 'Engenharia, mecânica, construção, agronomia, TI de infraestrutura.',
  I: 'Ciências, pesquisa, medicina, dados, análise e tecnologia.',
  A: 'Design, publicidade, música, escrita, arquitetura e artes.',
  S: 'Educação, saúde, psicologia, RH e serviço social.',
  E: 'Vendas, empreendedorismo, gestão, direito e marketing.',
  C: 'Finanças, contabilidade, administração, logística e auditoria.',
};

export function scoreRiasec(answers: number[]): {
  dims: DimensionScore[];
  headline: string;
  careers: string[];
} {
  const acc: Record<string, { sum: number; count: number }> = {};
  riasecItems.forEach((item, i) => {
    const a = answers[i] ?? 3;
    const val = item.reverse ? 6 - a : a;
    if (!acc[item.dim]) acc[item.dim] = { sum: 0, count: 0 };
    acc[item.dim].sum += val;
    acc[item.dim].count += 1;
  });

  const order = ['R', 'I', 'A', 'S', 'E', 'C'];
  const dims: DimensionScore[] = order.map((k) => {
    const { sum, count } = acc[k];
    const pct = Math.round(((sum - count) / (count * 4)) * 100);
    return { key: k, label: LABELS[k], pct: Math.max(0, Math.min(100, pct)), desc: DESC[k] };
  });

  const top3 = [...dims].sort((a, b) => b.pct - a.pct).slice(0, 3);
  const headline = top3.map((d) => d.key).join('');
  const careers = top3.map((d) => CAREERS[d.key]);
  return { dims, headline, careers };
}
