import { useEffect, useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { track } from '../lib/tracking';
import { supabaseEnabled } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { peekPendingResult } from '../lib/pendingResult';
import CreateAccount from './CreateAccount';

// Retorno do Stripe Checkout. O servidor pergunta pra Stripe se a sessão foi
// concluída (acesso só com pagamento verificado, não por ?paid=1 na URL).
// Com pagamento OK e Supabase ligado, oferece o cadastro no 1º acesso (criar
// senha) — que linka o pagamento à conta e salva o resultado do teste.

type State = 'checking' | 'ok' | 'failed';

export default function PaymentReturn() {
  const [state, setState] = useState<State>('checking');
  const [sessionId, setSessionId] = useState('');
  const [accountDone, setAccountDone] = useState(false);
  // Captura o resultado ANTES do CreateAccount fazer o flush (que remove) —
  // pra mostrar o QI (o entregável) na hora, no pico do pagamento.
  const [pending] = useState(() => peekPendingResult());
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    setSessionId(sid || '');
    if (!sid) {
      setState('ok');
      return;
    }
    fetch(`/api/verify-session?session_id=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.paid) {
          // Purchase no browser com event_id = session_id -> deduplica com o
          // Purchase server-side do stripe-webhook (mesmo id).
          try {
            track(
              'Purchase',
              {
                value: (d.amountTotal ?? 0) / 100,
                currency: (d.currency || 'brl').toUpperCase(),
                content_name: 'assinatura_qimind',
              },
              {},
              { eventId: sid },
            );
          } catch { /* ignore */ }
        }
        setState(d?.paid ? 'ok' : 'failed');
      })
      .catch(() => setState('failed'));
  }, []);

  const shell = 'min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4';
  const card = 'bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center';

  if (state === 'checking') {
    return (
      <div className={shell}>
        <div className={card}>
          <Loader2 className="w-10 h-10 text-brand mx-auto mb-4 animate-spin" />
          <h1 className="text-xl font-bold text-ink">Confirmando seu pagamento…</h1>
          <p className="text-gray-500 text-sm mt-2">Só um instante.</p>
        </div>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className={shell}>
        <div className={card}>
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">Não conseguimos confirmar o pagamento</h1>
          <p className="text-gray-600 text-sm mb-6">
            Se você concluiu a compra, aguarde alguns segundos e recarregue. Se persistir, fale com o suporte.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Pago. Se o Supabase está ligado, o pagamento tem sessão e o usuário ainda
  // não está logado, oferece o cadastro no 1º acesso.
  const needsAccount = supabaseEnabled && !!sessionId && !authLoading && !user && !accountDone;
  if (needsAccount) {
    return <CreateAccount sessionId={sessionId} onDone={() => setAccountDone(true)} />;
  }

  // Entregável: o QI que a pessoa pagou pra ver, na hora. Vem do resultado real
  // capturado (mesmo dado salvo no test_results), então bate com a plataforma.
  const rd = (pending?.resultData as {
    iq?: number; classification?: string; percentile?: number;
  }) || {};
  const hasIQ = typeof rd.iq === 'number';

  return (
    <div className={shell}>
      <div className={card}>
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
          <Check className="w-4 h-4" /> Pagamento confirmado
        </div>

        {hasIQ ? (
          <>
            <div className="text-xs uppercase tracking-widest text-slate-400">Seu QI</div>
            <div className="font-display text-6xl font-bold text-brand tabular-nums my-1">{rd.iq}</div>
            <p className="text-slate-600 font-medium">
              {rd.classification}
              {typeof rd.percentile === 'number' ? ` · percentil ${rd.percentile}` : ''}
            </p>
            <p className="text-slate-500 text-sm mt-3 mb-6">
              Salvo na sua conta. Veja o laudo completo, o mapa de raciocínio e comece a treinar.
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">🎉</div>
            <h1 className="text-2xl font-extrabold text-ink mb-2">Tudo pronto!</h1>
            <p className="text-gray-600 mb-6">Seu acesso está liberado. Bem-vindo(a) ao clube.</p>
          </>
        )}

        <button
          onClick={() => (window.location.href = '/#plataforma')}
          className="w-full bg-brand text-white py-3.5 rounded-xl hover:bg-brand-dark transition-colors font-semibold"
        >
          {hasIQ ? 'Ver meu relatório completo' : 'Entrar na plataforma'}
        </button>
      </div>
    </div>
  );
}
