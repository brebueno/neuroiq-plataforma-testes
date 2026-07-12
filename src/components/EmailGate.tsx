import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

// Captura de e-mail ANTES do reveal, recupera o lead mesmo quem não paga
// (sequência de abandono). Enquadrado como benefício ("pra receber o
// certificado"), não pedágio. Dispara /api/lead (stub pro ESP/CRM).
interface EmailGateProps {
  onSubmit: (email: string) => void;
  onBack: () => void;
}

export default function EmailGate({ onSubmit, onBack }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const submit = () => {
    if (!valid) return;
    // Lead capture, não bloqueia o fluxo se falhar.
    try {
      void fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, event: 'test_completed' }),
      });
    } catch {
      /* segue mesmo se o lead falhar */
    }
    onSubmit(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-brand-light grid place-items-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-brand" />
        </div>
        <h2 className="text-2xl font-extrabold text-ink mb-2">Seu resultado está pronto.</h2>
        <p className="text-slate-500 text-sm mb-6">Pra onde enviamos seu certificado e o resultado completo?</p>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="seu@email.com"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-3 text-center focus:outline-none focus:border-brand"
        />
        <button
          onClick={submit}
          disabled={!valid}
          className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          Ver meu resultado <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-[11px] text-slate-400 mt-3">Sem spam. Só o link do seu resultado.</p>
        <button onClick={onBack} className="mt-3 text-slate-400 hover:text-slate-600 text-sm">Voltar</button>
      </div>
    </div>
  );
}
