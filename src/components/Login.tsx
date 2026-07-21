import { useState } from 'react';
import { Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';

// Login de quem volta. Entra pela conta criada no 1º acesso pós-pagamento.
// Após signInWithPassword, o useAuth do App reage e libera a plataforma.
interface Props {
  onSuccess: () => void;
  onBack: () => void;
  onNoAccount: () => void; // não tem conta -> manda pro teste/funil
}

export default function Login({ onSuccess, onBack, onNoAccount }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const valid = emailOk && password.length >= 1;

  const submit = async () => {
    if (!valid || !supabase) return;
    setLoading(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (e) {
      setError('Email ou senha incorretos.');
      setLoading(false);
      return;
    }
    onSuccess();
  };

  const inputClass = 'w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-extrabold text-ink text-center mb-1">Entrar na sua conta</h1>
        <p className="text-slate-500 text-sm text-center mb-6">Acesse sua plataforma e seu resultado.</p>

        <div className="space-y-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={inputClass}
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Sua senha"
            className={inputClass}
          />
        </div>

        {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}

        <button
          onClick={submit}
          disabled={!valid || loading}
          className="mt-5 w-full bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Entrar <LogIn className="w-5 h-5" /></>}
        </button>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <button onClick={onNoAccount} className="text-brand font-semibold hover:text-brand-dark">
            Ainda não tem conta? Fazer o teste
          </button>
        </div>
      </div>
    </div>
  );
}
