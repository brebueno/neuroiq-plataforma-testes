import { Question } from './types';

// VERBAL question generators (text, pt-BR). These break the "everything is a
// shape" monotony of the visual types. Content is original/curated and
// generated at runtime, so it's free to use and varies per session.

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------- Verbal analogy: A está para B assim como C está para ? ----------
interface Analogy {
  a: string;
  b: string;
  c: string;
  answer: string;
  wrong: string[];
}

const ANALOGIES: Analogy[] = [
  { a: 'Leite', b: 'copo', c: 'carta', answer: 'envelope', wrong: ['caneta', 'papel', 'selo', 'mesa'] },
  { a: 'Médico', b: 'hospital', c: 'professor', answer: 'escola', wrong: ['aluno', 'livro', 'quadro', 'escritório'] },
  { a: 'Pássaro', b: 'céu', c: 'peixe', answer: 'água', wrong: ['rede', 'barco', 'areia', 'gaiola'] },
  { a: 'Quente', b: 'frio', c: 'alto', answer: 'baixo', wrong: ['grande', 'largo', 'fundo', 'longe'] },
  { a: 'Fome', b: 'comida', c: 'sede', answer: 'água', wrong: ['prato', 'copo', 'calor', 'sono'] },
  { a: 'Roda', b: 'carro', c: 'asa', answer: 'avião', wrong: ['motor', 'estrada', 'piloto', 'vento'] },
  { a: 'Autor', b: 'livro', c: 'pintor', answer: 'quadro', wrong: ['pincel', 'tinta', 'museu', 'moldura'] },
  { a: 'Chave', b: 'fechadura', c: 'senha', answer: 'conta', wrong: ['porta', 'cofre', 'cadeado', 'cartão'] },
  { a: 'Abelha', b: 'mel', c: 'vaca', answer: 'leite', wrong: ['queijo', 'grama', 'fazenda', 'chifre'] },
  { a: 'Relógio', b: 'tempo', c: 'termômetro', answer: 'temperatura', wrong: ['febre', 'calor', 'remédio', 'grau'] },
  { a: 'Dedo', b: 'mão', c: 'folha', answer: 'árvore', wrong: ['galho', 'raiz', 'tronco', 'flor'] },
  { a: 'Cão', b: 'latido', c: 'gato', answer: 'miado', wrong: ['rugido', 'som', 'pelo', 'bigode'] },
  { a: 'Sapato', b: 'pé', c: 'luva', answer: 'mão', wrong: ['dedo', 'meia', 'braço', 'cabeça'] },
  { a: 'Jovem', b: 'velho', c: 'dia', answer: 'noite', wrong: ['sol', 'tarde', 'hora', 'tempo'] },
  { a: 'Ovo', b: 'galinha', c: 'semente', answer: 'planta', wrong: ['terra', 'água', 'flor', 'fruto'] },
  { a: 'Palavra', b: 'frase', c: 'nota', answer: 'música', wrong: ['som', 'letra', 'ritmo', 'voz'] },
];

export function generateVerbalAnalogy(difficulty: number): Question {
  const it = pick(ANALOGIES);
  const options = shuffle([it.answer, ...shuffle(it.wrong).slice(0, 4)]);
  return {
    type: 'verbal-analogy',
    difficulty,
    prompt: `${it.a} está para ${it.b}, assim como ${it.c} está para:`,
    optionKind: 'text',
    options,
    correctAnswer: options.indexOf(it.answer),
  };
}

// ---------- Verbal odd-one-out: 4 da mesma categoria + 1 intruso ----------
interface OddSet {
  group: string[];
  odd: string;
}

const ODD_SETS: OddSet[] = [
  { group: ['Cachorro', 'Gato', 'Cavalo', 'Leão'], odd: 'Mesa' },
  { group: ['Maçã', 'Banana', 'Uva', 'Laranja'], odd: 'Cenoura' },
  { group: ['Ouro', 'Prata', 'Ferro', 'Cobre'], odd: 'Madeira' },
  { group: ['Azul', 'Verde', 'Vermelho', 'Amarelo'], odd: 'Círculo' },
  { group: ['Brasil', 'França', 'Japão', 'Egito'], odd: 'Paris' },
  { group: ['Braço', 'Perna', 'Joelho', 'Ombro'], odd: 'Cadeira' },
  { group: ['Carro', 'Ônibus', 'Avião', 'Moto'], odd: 'Girafa' },
  { group: ['Médico', 'Professor', 'Engenheiro', 'Advogado'], odd: 'Martelo' },
  { group: ['Marte', 'Vênus', 'Júpiter', 'Saturno'], odd: 'Sol' },
  { group: ['Violão', 'Piano', 'Flauta', 'Bateria'], odd: 'Futebol' },
  { group: ['Rosa', 'Margarida', 'Girassol', 'Tulipa'], odd: 'Carvalho' },
  { group: ['Segundo', 'Minuto', 'Hora', 'Dia'], odd: 'Quilômetro' },
];

export function generateVerbalOddOne(difficulty: number): Question {
  const it = pick(ODD_SETS);
  const options = shuffle([...it.group, it.odd]);
  return {
    type: 'verbal-oddone',
    difficulty,
    prompt: 'Qual das palavras é a diferente?',
    optionKind: 'text',
    options,
    correctAnswer: options.indexOf(it.odd),
  };
}
