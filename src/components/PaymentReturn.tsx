import { useEffect, useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';

// Shown when the user returns from Stripe Checkout. It calls the server, which
// asks Stripe whether the session actually completed, so access is only
// granted on a real, verified payment (not by faking ?paid=1 in the URL).

type State = 'checking' | 'ok' | 'failed';

export default function PaymentReturn() {
  const [state, setState] = useState<State>('checking');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) {
      // No session id (e.g. local demo redirect), nothing to verify.
      setState('ok');
      return;
    }
    fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => setState(d?.paid ? 'ok' : 'failed'))
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

  return (
    <div className={shell}>
      <div className={card}>
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-green-600" />
        </div>
        <div className="text-4xl mb-2">🎉</div>
        <h1 className="text-2xl font-extrabold text-ink mb-2">Pagamento confirmado!</h1>
        <p className="text-gray-600 mb-6">Seu acesso foi liberado. Bem-vindo(a) ao clube.</p>
        <button
          onClick={() => (window.location.href = '/')}
          className="w-full bg-brand text-white py-3.5 rounded-xl hover:bg-brand-dark transition-colors font-semibold"
        >
          Começar
        </button>
      </div>
    </div>
  );
}
