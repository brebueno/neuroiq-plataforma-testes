import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { trackLead } from '../lib/tracking';

// Lead gate rico ANTES do reveal: nome + telefone + email. Aparece no pico de
// curiosidade (resultado pronto, ainda oculto), então converte melhor do que
// pedir no começo. Telefone + email elevam o Event Match Quality da CAPI
// (buildUserData hasheia em/ph no server). Enquadrado como benefício
// ("pra liberar e enviar seu resultado"), não pedágio.

export interface Lead {
  name: string;
  phone: string;
  email: string;
}

interface EmailGateProps {
  onSubmit: (lead: Lead) => void;
  onBack: () => void;
}

// Máscara BR leve: (11) 91234-5678. Só formata, a validação usa os dígitos.
function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function EmailGate({ onSubmit, onBack }: EmailGateProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const nameOk = name.trim().length >= 2;
  const phoneOk = phone.replace(/\D/g, '').length >= 10; // DDD + número
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const valid = nameOk && phoneOk && emailOk;

  const submit = () => {
    if (!valid) return;
    const lead: Lead = { name: name.trim(), phone: phone.replace(/\D/g, ''), email: email.trim() };
    // Lead capture (stub pro ESP/CRM), não bloqueia o fluxo se falhar.
    try {
      void fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, event: 'test_completed' }),
      });
    } catch {
      /* segue mesmo se o lead falhar */
    }
    // Lead no Pixel + CAPI (email + telefone elevam o match).
    try { trackLead(lead.email, lead.phone); } catch { /* ignore */ }
    onSubmit(lead);
  };

  const inputClass =
    'w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-brand-light grid place-items-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-brand" />
        </div>
        <h2 className="text-2xl font-extrabold text-ink mb-2">Seu resultado está pronto.</h2>
        <p className="text-slate-500 text-sm mb-6">
          Falta só liberar. Pra onde enviamos seu resultado completo e o certificado?
        </p>

        <div className="space-y-3 text-left">
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className={inputClass}
          />
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 91234-5678"
            className={inputClass}
          />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="seu@email.com"
            className={inputClass}
          />
        </div>

        <button
          onClick={submit}
          disabled={!valid}
          className="mt-5 w-full bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          Ver meu resultado <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-[11px] text-slate-400 mt-3">Sem spam. Usamos seus dados só pra liberar e enviar seu resultado.</p>
        <button onClick={onBack} className="mt-3 text-slate-400 hover:text-slate-600 text-sm">Voltar</button>
      </div>
    </div>
  );
}
