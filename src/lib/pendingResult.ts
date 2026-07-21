import { supabase } from './supabase';

// O resultado do teste é calculado ANTES do pagamento, mas o usuário só cria a
// conta DEPOIS (e o retorno do Stripe recarrega a página, perdendo o state).
// Então guardamos o resultado no localStorage ao entrar no paywall e gravamos
// em test_results (browser autenticado, RLS: só a própria linha) assim que a
// conta existe.
const KEY = 'qm_pending_result';

export interface PendingResult {
  testType: string;
  score: number;
  questionsTotal: number;
  questionsCorrect: number;
  resultData: Record<string, unknown>;
}

export function stashPendingResult(r: PendingResult): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(r));
  } catch {
    /* localStorage indisponível — segue sem persistir */
  }
}

// Lê sem remover — usado pra MOSTRAR o entregável (o QI) na volta do pagamento,
// antes do flush (que salva e remove) rodar no cadastro.
export function peekPendingResult(): PendingResult | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingResult) : null;
  } catch {
    return null;
  }
}

export function popPendingResult(): PendingResult | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    localStorage.removeItem(KEY);
    return JSON.parse(raw) as PendingResult;
  } catch {
    return null;
  }
}

// Grava o resultado pendente (se houver) na conta recém-criada/logada.
export async function flushPendingResult(userId: string): Promise<void> {
  const r = popPendingResult();
  if (!r || !supabase) return;
  const { error } = await supabase.from('test_results').insert({
    user_id: userId,
    test_type: r.testType,
    score: r.score,
    questions_total: r.questionsTotal,
    questions_correct: r.questionsCorrect,
    result_data: r.resultData,
  });
  if (error) {
    // Não relança: falhar em salvar o histórico não pode bloquear o acesso pago.
    // eslint-disable-next-line no-console
    console.error('[pendingResult] flush', error.message);
  }
}
