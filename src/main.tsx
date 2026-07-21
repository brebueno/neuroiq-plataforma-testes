import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initTracking } from './lib/tracking';

// Captura fbclid/gclid/UTM no 1º acesso e persiste (antes de renderizar).
initTracking();

// Sem <StrictMode>: o Stripe Embedded Checkout não suporta o duplo-mount que o
// StrictMode faz em dev ("You cannot have multiple Embedded Checkout objects"),
// e isso travava o formulário de pagamento no localhost. Produção nunca foi
// afetada (o duplo-mount é exclusivo do dev). Ver StripeCheckout.tsx.
createRoot(document.getElementById('root')!).render(<App />);
