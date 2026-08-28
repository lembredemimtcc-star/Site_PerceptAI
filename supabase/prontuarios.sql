-- Execute no SQL Editor do Supabase se a tabela ainda não existir.
create table if not exists public.prontuarios (
  id uuid primary key default gen_random_uuid(),
  internacao_id uuid,
  queixa_principal text,
  historia_doenca text,
  avaliacao text,
  orientacoes text,
  exames jsonb default '[]'::jsonb,
  atualizado_em timestamptz default now()
);

alter table public.prontuarios enable row level security;

drop policy if exists "prontuarios_select" on public.prontuarios;
drop policy if exists "prontuarios_write" on public.prontuarios;

create policy "prontuarios_select" on public.prontuarios for select to authenticated using (true);
create policy "prontuarios_write" on public.prontuarios for all to authenticated using (true) with check (true);
