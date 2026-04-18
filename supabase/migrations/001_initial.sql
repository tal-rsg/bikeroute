-- BikeRoute — Schema inicial
-- Execute no Supabase Dashboard > SQL Editor

-- ─── Extensões ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Tabela: profiles ────────────────────────────────────────────────────────
-- Perfil público do usuário (espelho de auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  city        text,
  bio         text,
  avatar_url  text,
  weekly_goal_km numeric(6,1) default 80,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "perfil visivel para todos autenticados"
  on public.profiles for select
  to authenticated using (true);

create policy "usuario edita apenas o proprio perfil"
  on public.profiles for all
  using (auth.uid() = id);

-- Cria perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Tabela: routes ──────────────────────────────────────────────────────────
create table public.routes (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  description      text,
  type             text check (type in ('urbano','trilha','estrada')) default 'urbano',
  difficulty       text check (difficulty in ('easy','medium','hard')) default 'easy',
  privacy          text check (privacy in ('public','private')) default 'public',
  distance_km      numeric(8,2) default 0,
  duration_seconds integer default 0,
  elevation_gain   integer default 0,
  elevation_loss   integer default 0,
  avg_speed        numeric(5,1) default 0,
  calories         integer default 0,
  cover_image      text,
  started_at       timestamptz,
  finished_at      timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  deleted_at       timestamptz               -- soft delete para sync
);

alter table public.routes enable row level security;

create policy "usuario ve apenas suas rotas ou publicas"
  on public.routes for select
  using (
    auth.uid() = user_id
    or (privacy = 'public' and deleted_at is null)
  );

create policy "usuario gerencia proprias rotas"
  on public.routes for all
  using (auth.uid() = user_id);

-- ─── Tabela: route_points ────────────────────────────────────────────────────
-- Pontos GPS individuais de cada rota
create table public.route_points (
  id          bigserial primary key,
  route_id    uuid not null references public.routes(id) on delete cascade,
  lat         numeric(10,7) not null,
  lng         numeric(10,7) not null,
  altitude    numeric(8,2),
  speed       numeric(5,1),
  accuracy    numeric(6,2),
  recorded_at timestamptz not null
);

alter table public.route_points enable row level security;

create policy "pontos visíveis pelo dono da rota"
  on public.route_points for select
  using (
    route_id in (select id from public.routes where user_id = auth.uid())
  );

create policy "dono da rota gerencia pontos"
  on public.route_points for all
  using (
    route_id in (select id from public.routes where user_id = auth.uid())
  );

-- Índices de performance
create index idx_route_points_route_id on public.route_points(route_id);
create index idx_route_points_recorded_at on public.route_points(route_id, recorded_at);
create index idx_routes_user_id on public.routes(user_id, deleted_at);
create index idx_routes_updated_at on public.routes(user_id, updated_at);

-- ─── Função: updated_at automático ───────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_routes_updated_at
  before update on public.routes
  for each row execute procedure public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
