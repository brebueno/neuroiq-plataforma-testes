-- ============================================================================
-- NeuroIQ — Fix de segurança de DB
-- Rodar no Supabase → SQL Editor (projeto msspoccibelffajjosme), uma vez.
-- ============================================================================

-- [CRÍTICO] Só o servidor (service_role) pode ESCREVER em profiles.
-- Sem isto, qualquer usuário logado se auto-concede assinatura pelo browser:
--     supabase.from('profiles').update({ subscription_status: 'active' })
-- (confirmado explorável no pentest). SELECT da própria linha continua valendo
-- pela policy de RLS existente; quem escreve profiles é sempre o server.
revoke insert, update, delete on public.profiles from anon, authenticated;

-- [HARDENING] Idempotência forte do pagamento: cada customer Stripe só pode ter
-- 1 profile. Fecha o replay em corrida (1 pagamento -> N contas). Vários NULL
-- são permitidos (profiles recém-criados, antes de ativar), então é seguro.
alter table public.profiles drop constraint if exists profiles_stripe_customer_id_key;
alter table public.profiles add constraint profiles_stripe_customer_id_key unique (stripe_customer_id);

-- ----------------------------------------------------------------------------
-- APÓS RODAR: crie 1 conta de teste (fluxo pós-pagamento) e confirme que o
-- profile ainda é criado. O trigger handle_new_user do Supabase é SECURITY
-- DEFINER por padrão, então o revoke de INSERT NÃO o afeta. Se por acaso o
-- cadastro parar de criar o profile, o trigger é SECURITY INVOKER — nesse caso
-- troque a 1ª linha por:  revoke update, delete on public.profiles from anon, authenticated;
-- (fecha a auto-escalação sem tocar no INSERT).
-- ----------------------------------------------------------------------------
