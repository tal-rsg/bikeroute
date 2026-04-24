-- BikeRoute — Tabela de bikes do usuário
-- Execute no Supabase Dashboard > SQL Editor

-- ─── Tabela: bikes ───────────────────────────────────────────────────────────
create table public.bikes (
  id          uuid primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        text check (type in ('estrada','mountain','ebike')) not null default 'mountain',
  brand       text,
  model       text,
  year        smallint,
  deleted_at  timestamptz,               -- soft delete para sync
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.bikes enable row level security;

create policy "usuario ve apenas suas bikes"
  on public.bikes for select
  using (auth.uid() = user_id);

create policy "usuario gerencia proprias bikes"
  on public.bikes for all
  using (auth.uid() = user_id);

create index idx_bikes_user_id on public.bikes(user_id, deleted_at);

create trigger set_bikes_updated_at
  before update on public.bikes
  for each row execute procedure public.set_updated_at();
