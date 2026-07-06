// The matrix generator now lives in matrixEngine.ts, which implements the five
// Raven rule families instead of a single arithmetic progression. This file
// stays as the stable import point for the rest of the app.
export { generatePuzzle } from './matrixEngine';
