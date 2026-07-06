import { Question } from './types';
import { Level } from '../types/game';
import { generatePuzzle } from '../utils/matrixEngine';

// Wrap the matrix engine as a Question. Floor the difficulty at level 2 so the
// full test never opens with the trivial single-attribute matrices that felt
// repetitive — matrices here always have 2+ things going on.
export function generateMatrix(difficulty: number): Question {
  const level = Math.min(6, Math.max(2, difficulty)) as Level;
  const p = generatePuzzle(level);
  return {
    type: 'matrix',
    difficulty,
    prompt: 'Qual figura completa o padrão?',
    optionKind: 'pattern',
    options: p.options,
    correctAnswer: p.correctAnswer,
    matrix: p.matrix,
  };
}
