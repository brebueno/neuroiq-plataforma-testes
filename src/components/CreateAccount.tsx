import { useState } from 'react';
import { Loader2, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { flushPendingResult } from '../lib/pendingResult';

// 1º acesso pós-pagamento: a pessoa já pagou (como convidado) e agora só define
// uma SENHA. O email NÃO é digitado nem exibido aqui — o servidor deriva o email
// da própria sessão Stripe (o pagador) em /api/complete-signup. Isso fecha o
// vetor de sequestro de conta (email arbitrário) e o vazamento de PII.
interface Props {
  sessionId: string;
  onDone: () => void;
}

export default function CreateAccount({ sessionId, onDone }: Props) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = password.length >= 6;

  const submit = async () => {
    if (!valid || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, password }),
      });
      const d = await resp.json().catch(() => ({}));
      const acctEmail = typeof d?.email === 'string' ? d.email : '';

      if (resp.status === 409) {
        // Conta já existe pra esse pagamento: entra com a senha informada.
        if (!acctEmail) throw new Error('Essa conta já existe. Use "entrar" com sua senha.');
        const { data, error: e } = await supabase.auth.signInWithPassword({ email: acctEmail, password });
        if (e) throw new Error('Essa conta já existe. Confira a senha e tente entrar.');
        if (data.user) await flushPendingResult(data.user.id);
        onDone();
        return;
      }
      if (!resp.ok || !acctEmail) throw new Error(d.error || 'Não foi possível ativar sua conta.');

      // Conta criada com o email do pagamento -> loga com ele.
      const { data, error: e } = await supabase.auth.signInWithPassword({ email: acctEmail, password });
      if (e) throw new Error('Conta criada, mas o login falhou. Tente entrar de novo.');
      if (data.user) await flushPendingResult(data.user.id);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h1 className="text-2xl font-extrabold text-ink mb-1">Pagamento confirmado!</h1>
        <p className="text-slate-500 text-sm mb-6">
          Crie uma senha pra acessar sua plataforma quando quiser. Ela fica vinculada ao email do seu pagamento.
        </p>

        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Crie uma senha (mín. 6 caracteres)"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand text-center"
        />

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <button
          onClick={submit}
          disabled={!valid || loading}
          className="mt-5 w-full bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Acessar minha plataforma <ArrowRight className="w-5 h-5" /></>}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-3">
          <Lock className="w-3 h-3" /> Sua conta protege seu acesso e histórico.
        </p>
      </div>
    </div>
  );
}
