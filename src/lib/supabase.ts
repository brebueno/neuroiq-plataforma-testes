import { createClient } from '@supabase/supabase-js';

// Client do browser (chave PUBLISHABLE/anon). Seguro no bundle: o RLS protege as
// tabelas (leitura/escrita só da própria linha, via auth.uid()). Fica NULO se as
// envs faltarem — o funil de venda funciona sem Supabase; só a conta/plataforma
// logada depende dele. Não derrubamos o app inteiro por causa disso.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL/ANON_KEY ausentes — auth e plataforma logada desabilitados.');
}

export const supabase = url && anon ? createClient(url, anon) : null;
export const supabaseEnabled = Boolean(url && anon);
