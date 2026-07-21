import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// Último resultado de QI do usuário logado, lido de test_results (fonte de
// verdade). A plataforma mostra ISSO — não o bestIQ do localStorage, que é o
// maior histórico daquele navegador e diverge do teste que a pessoa pagou.
export interface LatestResult {
  iq: number | null;
  percentile: number | null;
  score: number | null;
  total: number | null;
  loading: boolean;
}

export function useLatestResult(): LatestResult {
  const { user } = useAuth();
  const [state, setState] = useState<LatestResult>({ iq: null, percentile: null, score: null, total: null, loading: true });

  useEffect(() => {
    if (!supabase || !user) {
      setState({ iq: null, percentile: null, score: null, total: null, loading: false });
      return;
    }
    let alive = true;
    supabase
      .from('test_results')
      .select('score, questions_total, result_data, completed_at')
      .eq('user_id', user.id)
      .eq('test_type', 'iq')
      .order('completed_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!alive) return;
        const r = data && data[0];
        const rd = (r?.result_data as Record<string, unknown>) || {};
        setState({
          iq: typeof rd.iq === 'number' ? rd.iq : null,
          percentile: typeof rd.percentile === 'number' ? rd.percentile : null,
          score: typeof r?.score === 'number' ? r.score : null,
          total: typeof r?.questions_total === 'number' ? r.questions_total : null,
          loading: false,
        });
      });
    return () => {
      alive = false;
    };
  }, [user]);

  return state;
}
