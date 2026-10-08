-- Repositorios (caché compartida de datos públicos de GitHub) y su relación con cada usuario.
-- Los usuarios viven en auth.users (Supabase Auth).

-- Tablas --------------------------------------------------------------------

create table public.repositories (
  id uuid primary key default gen_random_uuid(),
  github_id bigint not null,
  name text not null,
  full_name text not null,
  description text,
  html_url text not null,
  language text,
  stars integer not null default 0,
  forks integer not null default 0,
  open_issues integer not null default 0,
  license text,
  owner_login text,
  owner_avatar_url text,
  updated_at timestamptz,
  created_at timestamptz,
  -- Última sincronización con GitHub.
  synced_at timestamptz not null default now(),
  -- Un repositorio de GitHub aparece una sola vez en la caché.
  constraint repositories_github_id_key unique (github_id)
);

create table public.user_repositories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Un usuario no puede guardar dos veces el mismo repositorio.
  constraint user_repositories_user_repository_key unique (user_id, repository_id)
);

create index user_repositories_user_id_idx on public.user_repositories (user_id);
create index user_repositories_repository_id_idx on public.user_repositories (repository_id);

-- Row Level Security --------------------------------------------------------

alter table public.repositories enable row level security;
alter table public.user_repositories enable row level security;

-- Cualquier usuario autenticado puede leer y actualizar la caché de repositorios
-- (son datos públicos de GitHub). Nadie anónimo puede tocarla. No hay política de borrado.
create policy "Usuarios autenticados leen repositorios"
  on public.repositories for select
  to authenticated
  using (true);

create policy "Usuarios autenticados insertan repositorios"
  on public.repositories for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados actualizan repositorios"
  on public.repositories for update
  to authenticated
  using (true)
  with check (true);

-- Cada usuario solo ve, guarda y quita sus propios repositorios.
create policy "Usuarios ven sus repositorios guardados"
  on public.user_repositories for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Usuarios guardan repositorios para si mismos"
  on public.user_repositories for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Usuarios quitan sus repositorios guardados"
  on public.user_repositories for delete
  to authenticated
  using (user_id = (select auth.uid()));
