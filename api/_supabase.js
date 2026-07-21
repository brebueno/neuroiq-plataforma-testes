import { createClient } from '@supabase/supabase-js';

// Client server-side com SERVICE ROLE (bypassa RLS). SÓ nas serverless
// functions, NUNCA no browser. Usado pelo stripe-webhook pra escrever a
// assinatura em `profiles` (o usuário não pode se auto-conceder assinatura) e
// pelo complete-signup pra gravar a assinatura inicial após o pagamento.
//
// Prefixo "_" = a Vercel NÃO trata este arquivo como rota HTTP.
let cached = null;

export function supabaseAdmin() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('[supabase-admin] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes — sync desabilitado.');
    return null;
  }
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

// Atualiza a assinatura de um profile localizado pelo stripe_customer_id.
// Retorna quantas linhas foram afetadas (0 = usuário ainda não criou conta).
export async function setSubscriptionByCustomer(customerId, { status, endsAt } = {}) {
  const admin = supabaseAdmin();
  if (!admin || !customerId) return 0;
  const patch = { subscription_status: status };
  if (endsAt !== undefined) patch.subscription_ends_at = endsAt;
  const { data, error } = await admin
    .from('profiles')
    .update(patch)
    .eq('stripe_customer_id', customerId)
    .select('id');
  if (error) {
    console.error('[supabase-admin] setSubscriptionByCustomer', error.message);
    return 0;
  }
  return (data || []).length;
}
