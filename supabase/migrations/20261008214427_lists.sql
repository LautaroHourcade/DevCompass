-- Listas personales de repositorios guardados.
-- Una lista solo puede contener repositorios que el usuario tiene guardados:
-- por eso list_repositories apunta a user_repositories y no a repositories.
-- Al quitar un repositorio de Guardados, desaparece también de todas sus listas.

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lists_name_length check (char_length(trim(name)) between 1 and 60),
  constraint lists_description_length check (description is null or char_length(description) <= 280),
  -- Un usuario no puede tener dos listas con el mismo nombre.
  constraint lists_user_name_key unique (user_id, name)
);

create table public.list_repositories (
  list_id uuid not null references public.lists (id) on delete cascade,
  user_repository_id uuid not null references public.user_repositories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id, user_repository_id)
);

create index list_repositories_user_repository_id_idx
  on public.list_repositories (user_repository_id);

-- updated_at se mantiene solo ----------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger lists_set_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------------

alter table public.lists enable row level security;
alter table public.list_repositories enable row level security;

create policy "Usuarios gestionan sus listas"
  on public.lists for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Para leer, añadir o quitar repos de una lista, la lista debe ser del usuario.
-- Para añadir, además, el repo guardado también debe ser suyo.
create policy "Usuarios ven los repos de sus listas"
  on public.list_repositories for select
  to authenticated
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_repositories.list_id and lists.user_id = (select auth.uid())
    )
  );

create policy "Usuarios añaden repos a sus listas"
  on public.list_repositories for insert
  to authenticated
  with check (
    exists (
      select 1 from public.lists
      where lists.id = list_repositories.list_id and lists.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.user_repositories
      where user_repositories.id = list_repositories.user_repository_id
        and user_repositories.user_id = (select auth.uid())
    )
  );

create policy "Usuarios quitan repos de sus listas"
  on public.list_repositories for delete
  to authenticated
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_repositories.list_id and lists.user_id = (select auth.uid())
    )
  );
