import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initTracking } from './lib/tracking';

// Captura fbclid/gclid/UTM no 1º acesso e persiste (antes de renderizar).
initTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
