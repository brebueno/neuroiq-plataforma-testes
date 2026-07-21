import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// Lê a assinatura do usuário logado a partir de `profiles` (RLS: só a própria
// linha) e escuta mudanças em realtime — quando o webhook atualiza o
// subscription_status, a UI reage sem refresh. isPaid = active | trialing.
const ACTIVE = new Set(['active', 'trialing']);

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('none');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !user) {
      setStatus('none');
      setIsPaid(false);
      setLoading(false);
      return;
    }
    const sb = supabase; // ref não-nula pra usar dentro do closure de cleanup

    let alive = true;
    const apply = (s: string) => {
      setStatus(s);
      setIsPaid(ACTIVE.has(s));
    };

    sb
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!alive) return;
        if (!error && data) apply(data.subscription_status ?? 'none');
        setLoading(false);
      });

    const channel = sb
      .channel(`profile_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => apply(((payload.new as { subscription_status?: string }).subscription_status) ?? 'none'),
      )
      .subscribe();

    return () => {
      alive = false;
      sb.removeChannel(channel);
    };
  }, [user]);

  return { isPaid, status, loading };
}
