// Big Five (Five Factor Model), banco de 120 itens do IPIP-NEO-120 (John A.
// Johnson), traduzido para pt-BR. Domínio público. 5 domínios × 30 facetas × 4
// itens. A cada sessão sorteamos um subconjunto equilibrado (ver sampleBigFive),
// então refazer o teste nunca traz exatamente as mesmas perguntas, mas o
// equilíbrio entre dimensões é mantido, preservando a validade do resultado.
//
// `dim` já está no polo POSITIVO do traço exibido (O/C/E/A/ES); itens de
// Neuroticismo do IPIP viram Estabilidade Emocional com `reverse` ajustado.

export interface LikertItem {
  text: string;
  dim: string;
  reverse?: boolean;
  facet?: number;
}

export interface DimensionScore {
  key: string;
  label: string;
  pct: number;
  desc: string;
  color: string; // semantic color for the dimension
  note: string; // level-based narrative (low / balanced / high)
}

export const bigFivePool: LikertItem[] = [
  { text: "Me preocupo com as coisas", dim: 'ES', facet: 1, reverse: true },
  { text: "Faço amigos com facilidade", dim: 'E', facet: 1, reverse: false },
  { text: "Tenho uma imaginação fértil", dim: 'O', facet: 1, reverse: false },
  { text: "Confio nos outros", dim: 'A', facet: 1, reverse: false },
  { text: "Concluo as tarefas com sucesso", dim: 'C', facet: 1, reverse: false },
  { text: "Fico com raiva facilmente", dim: 'ES', facet: 2, reverse: true },
  { text: "Amo grandes festas", dim: 'E', facet: 2, reverse: false },
  { text: "Acredito na importância da arte", dim: 'O', facet: 2, reverse: false },
  { text: "Uso os outros para alcançar meus fins", dim: 'A', facet: 2, reverse: true },
  { text: "Gosto de organizar as coisas", dim: 'C', facet: 2, reverse: false },
  { text: "Frequentemente me sinto triste", dim: 'ES', facet: 3, reverse: true },
  { text: "Assumo a liderança das coisas", dim: 'E', facet: 3, reverse: false },
  { text: "Experimento minhas emoções intensamente", dim: 'O', facet: 3, reverse: false },
  { text: "Adoro ajudar aos outros", dim: 'A', facet: 3, reverse: false },
  { text: "Mantenho minhas promessas", dim: 'C', facet: 3, reverse: false },
  { text: "Tenho dificuldade de me aproximar dos outros", dim: 'ES', facet: 4, reverse: true },
  { text: "Estou sempre ocupado(a)", dim: 'E', facet: 4, reverse: false },
  { text: "Prefiro variedade à rotina", dim: 'O', facet: 4, reverse: false },
  { text: "Amo uma boa briga", dim: 'A', facet: 4, reverse: true },
  { text: "Trabalho muito", dim: 'C', facet: 4, reverse: false },
  { text: "Adoro ir em farras", dim: 'ES', facet: 5, reverse: true },
  { text: "Busco sempre emoção (adrenalina)", dim: 'E', facet: 5, reverse: false },
  { text: "Gosto de ler textos desafiadores", dim: 'O', facet: 5, reverse: false },
  { text: "Acredito ser melhor que os outros", dim: 'A', facet: 5, reverse: true },
  { text: "Estou sempre preparado(a)", dim: 'C', facet: 5, reverse: false },
  { text: "Entro em pânico facilmente", dim: 'ES', facet: 6, reverse: true },
  { text: "Irradio alegria", dim: 'E', facet: 6, reverse: false },
  { text: "Costumo votar em candidatos políticos liberais (progressistas)", dim: 'O', facet: 6, reverse: false },
  { text: "Me preocupo com os desabrigados", dim: 'A', facet: 6, reverse: false },
  { text: "Mergulho de cabeça nas coisas sem pensar", dim: 'C', facet: 6, reverse: true },
  { text: "Temo o pior", dim: 'ES', facet: 1, reverse: true },
  { text: "Me sinto confortável no meio das pessoas", dim: 'E', facet: 1, reverse: false },
  { text: "Adoro histórias fantásticas de fantasia e ficção", dim: 'O', facet: 1, reverse: false },
  { text: "Acredito que os outros têm boas intenções", dim: 'A', facet: 1, reverse: false },
  { text: "Sou excelente no que eu faço", dim: 'C', facet: 1, reverse: false },
  { text: "Me irrito facilmente", dim: 'ES', facet: 2, reverse: true },
  { text: "Converso com muitas pessoas diferentes em festas", dim: 'E', facet: 2, reverse: false },
  { text: "Vejo beleza em coisas que outros podem não notar", dim: 'O', facet: 2, reverse: false },
  { text: "Trapaceio para tirar vantagem", dim: 'A', facet: 2, reverse: true },
  { text: "Frequentemente esqueço de colocar as coisas de volta em seu lugar", dim: 'C', facet: 2, reverse: true },
  { text: "Não gosto de mim", dim: 'ES', facet: 3, reverse: true },
  { text: "Tento liderar os outros", dim: 'E', facet: 3, reverse: false },
  { text: "Sinto as emoções dos outros", dim: 'O', facet: 3, reverse: false },
  { text: "Me preocupo com os outros", dim: 'A', facet: 3, reverse: false },
  { text: "Digo a verdade", dim: 'C', facet: 3, reverse: false },
  { text: "Tenho medo de chamar a atenção", dim: 'ES', facet: 4, reverse: true },
  { text: "Estou sempre preparado(a)", dim: 'E', facet: 4, reverse: false },
  { text: "Prefiro lidar com coisas que eu conheça", dim: 'O', facet: 4, reverse: true },
  { text: "Grito com os outros", dim: 'A', facet: 4, reverse: true },
  { text: "Supero as expectativas", dim: 'C', facet: 4, reverse: false },
  { text: "Raramente me excedo em festas", dim: 'ES', facet: 5, reverse: false },
  { text: "Busco aventura", dim: 'E', facet: 5, reverse: false },
  { text: "Evito discussões filosóficas", dim: 'O', facet: 5, reverse: true },
  { text: "Penso muito em mim", dim: 'A', facet: 5, reverse: true },
  { text: "Transformo meus planos em realidade", dim: 'C', facet: 5, reverse: false },
  { text: "Me sinto sobrecarregado(a) com os eventos", dim: 'ES', facet: 6, reverse: true },
  { text: "Me divirto bastante", dim: 'E', facet: 6, reverse: false },
  { text: "Acredito que certo e errado são relativos", dim: 'O', facet: 6, reverse: false },
  { text: "Sinto simpatia por aqueles que estão em situação pior do que eu", dim: 'A', facet: 6, reverse: false },
  { text: "Tomo decisões difíceis", dim: 'C', facet: 6, reverse: true },
  { text: "Tenho medo de muitas coisas", dim: 'ES', facet: 1, reverse: true },
  { text: "Evito contatos com outras pessoas", dim: 'E', facet: 1, reverse: true },
  { text: "Amo ficar sonhando no mundo da lua", dim: 'O', facet: 1, reverse: false },
  { text: "Confio no que as pessoas dizem", dim: 'A', facet: 1, reverse: false },
  { text: "Executo as tarefas sem maiores problemas", dim: 'C', facet: 1, reverse: false },
  { text: "Perco a paciência facilmente", dim: 'ES', facet: 2, reverse: true },
  { text: "Prefiro ficar sozinho(a)", dim: 'E', facet: 2, reverse: true },
  { text: "Não gosto de poesia", dim: 'O', facet: 2, reverse: true },
  { text: "Tiro vantagem dos outros", dim: 'A', facet: 2, reverse: true },
  { text: "Meu quarto é uma bagunça", dim: 'C', facet: 2, reverse: true },
  { text: "Estou sempre deprimido(a)", dim: 'ES', facet: 3, reverse: true },
  { text: "Assumo o controle das coisas", dim: 'E', facet: 3, reverse: false },
  { text: "Raramente percebo minhas reações emocionais", dim: 'O', facet: 3, reverse: true },
  { text: "Sou indiferente ao sentimento dos outros", dim: 'A', facet: 3, reverse: true },
  { text: "Quebro as regras", dim: 'C', facet: 3, reverse: true },
  { text: "Só me sinto bem com meus amigos(as)", dim: 'ES', facet: 4, reverse: true },
  { text: "Faço muitas coisas no tempo livre", dim: 'E', facet: 4, reverse: false },
  { text: "Não gosto de mudanças", dim: 'O', facet: 4, reverse: true },
  { text: "Insulto os outros", dim: 'A', facet: 4, reverse: true },
  { text: "Eu trabalho apenas o suficiente para sobreviver", dim: 'C', facet: 4, reverse: true },
  { text: "Resisto facilmente às tentações", dim: 'ES', facet: 5, reverse: false },
  { text: "Gosto de ser inconsequente", dim: 'E', facet: 5, reverse: false },
  { text: "Tenho dificuldade em entender ideias abstratas", dim: 'O', facet: 5, reverse: true },
  { text: "Tenho uma opinião muito positiva sobre mim mesmo(a)", dim: 'A', facet: 5, reverse: true },
  { text: "Fico perdendo tempo", dim: 'C', facet: 5, reverse: true },
  { text: "Sinto que sou incapaz de lidar com as coisas", dim: 'ES', facet: 6, reverse: true },
  { text: "Amo a vida", dim: 'E', facet: 6, reverse: false },
  { text: "Costumo votar em candidatos políticos conservadores", dim: 'O', facet: 6, reverse: true },
  { text: "Não me interesso pelos problemas dos outros", dim: 'A', facet: 6, reverse: true },
  { text: "Me apresso nas coisas", dim: 'C', facet: 6, reverse: true },
  { text: "Me estresso facilmente", dim: 'ES', facet: 1, reverse: true },
  { text: "Mantenho distância dos outros", dim: 'E', facet: 1, reverse: true },
  { text: "Gosto de me perder em pensamentos", dim: 'O', facet: 1, reverse: false },
  { text: "Desconfio das pessoas", dim: 'A', facet: 1, reverse: true },
  { text: "Sei como fazer as coisas", dim: 'C', facet: 1, reverse: false },
  { text: "Não me incomodo facilmente", dim: 'ES', facet: 2, reverse: false },
  { text: "Evito multidões", dim: 'E', facet: 2, reverse: true },
  { text: "Não gosto de ir ao museu de arte", dim: 'O', facet: 2, reverse: true },
  { text: "Atrapalho os planos dos outros", dim: 'A', facet: 2, reverse: true },
  { text: "Deixo minhas coisas espalhadas", dim: 'C', facet: 2, reverse: true },
  { text: "Me sinto confortável comigo mesmo(a)", dim: 'ES', facet: 3, reverse: false },
  { text: "Aguardo outras pessoas tomarem a liderança das coisas", dim: 'E', facet: 3, reverse: true },
  { text: "Não entendo pessoas que agem emotivamente", dim: 'O', facet: 3, reverse: true },
  { text: "Não tiro tempo para os outros", dim: 'A', facet: 3, reverse: true },
  { text: "Quebro minhas promessas", dim: 'C', facet: 3, reverse: true },
  { text: "Não me incomodo com situações sociais difíceis", dim: 'ES', facet: 4, reverse: false },
  { text: "Gosto de pegar leve", dim: 'E', facet: 4, reverse: true },
  { text: "Me considero ter costumes tradicionais", dim: 'O', facet: 4, reverse: true },
  { text: "Entro em contato com os outros", dim: 'A', facet: 4, reverse: true },
  { text: "Dedico pouco tempo e esforço no meu trabalho", dim: 'C', facet: 4, reverse: true },
  { text: "Controlo minhas vontades", dim: 'ES', facet: 5, reverse: false },
  { text: "Ajo de forma descontrolada", dim: 'E', facet: 5, reverse: false },
  { text: "Não me interesso por discussões teóricas", dim: 'O', facet: 5, reverse: true },
  { text: "Gosto de falar das minhas virtudes", dim: 'A', facet: 5, reverse: true },
  { text: "Tenho dificuldade para começar as tarefas", dim: 'C', facet: 5, reverse: true },
  { text: "Permaneço calmo(a) sob pressão", dim: 'ES', facet: 6, reverse: false },
  { text: "Vejo o lado bom da vida", dim: 'E', facet: 6, reverse: false },
  { text: "Acredito que precisamos ser rígidos com o crime", dim: 'O', facet: 6, reverse: true },
  { text: "Tento não pensar nos necessitados", dim: 'A', facet: 6, reverse: true },
  { text: "Ajo sem pensar", dim: 'C', facet: 6, reverse: true },
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

// Low-pole descriptions (the other side of each trait) and a semantic color.
const LOW: Record<string, string> = {
  O: 'Prático e pé no chão, prefere o testado e aprovado.',
  C: 'Espontâneo e flexível, menos preso a planos e rotinas.',
  E: 'Reservado, recarrega as energias na própria companhia.',
  A: 'Direto e questionador, põe a verdade acima da harmonia.',
  ES: 'Sensível ao estresse, sente as coisas com intensidade.',
};

const COLORS: Record<string, string> = {
  O: '#7C6BFF',
  C: '#3B82F6',
  E: '#F59E0B',
  A: '#10B981',
  ES: '#14B8A6',
};

const noteFor = (key: string, pct: number): string =>
  pct >= 60 ? DESC[key] : pct <= 40 ? LOW[key] : `Equilíbrio entre os dois lados de ${LABELS[key].toLowerCase()}.`;

const shuffle = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * Sorteia um subconjunto equilibrado do banco: `perFacet` itens de cada uma das
 * 30 facetas. Padrão 2 → 60 itens (Quick). Use 4 para o teste completo (Deep).
 * Como cada faceta contribui igualmente, os 5 domínios ficam sempre balanceados.
 */
export function sampleBigFive(perFacet = 2): LikertItem[] {
  const byFacet: Record<string, LikertItem[]> = {};
  bigFivePool.forEach((it) => {
    const k = `${it.dim}:${it.facet}`;
    (byFacet[k] ||= []).push(it);
  });
  const picked: LikertItem[] = [];
  Object.values(byFacet).forEach((items) => {
    picked.push(...shuffle(items).slice(0, perFacet));
  });
  return shuffle(picked);
}

/** Pontua um conjunto de itens (o MESMO que foi respondido) nos 5 domínios. */
export function scoreBigFive(
  answers: number[],
  items: LikertItem[] = bigFivePool,
): { dims: DimensionScore[]; headline: string } {
  const acc: Record<string, { sum: number; count: number }> = {};
  items.forEach((item, i) => {
    const a = answers[i] ?? 3;
    const val = item.reverse ? 6 - a : a;
    (acc[item.dim] ||= { sum: 0, count: 0 });
    acc[item.dim].sum += val;
    acc[item.dim].count += 1;
  });

  const order = ['O', 'C', 'E', 'A', 'ES'];
  const dims: DimensionScore[] = order.map((k) => {
    const { sum, count } = acc[k] ?? { sum: 0, count: 1 };
    const pct = Math.max(0, Math.min(100, Math.round(((sum - count) / (count * 4)) * 100)));
    return { key: k, label: LABELS[k], pct, desc: DESC[k], color: COLORS[k], note: noteFor(k, pct) };
  });

  const top = [...dims].sort((a, b) => b.pct - a.pct)[0];
  return { dims, headline: top.label };
}
