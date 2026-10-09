-- Seguimiento de repositorios guardados: estado, nota y etiquetas propias.

-- Estado y nota de cada repositorio guardado ---------------------------------

alter table public.user_repositories
  add column status text not null default 'to_learn',
  add column notes text,
  add column updated_at timestamptz not null default now(),
  -- Por aprender, En progreso, Completado.
  add constraint user_repositories_status_check
    check (status in ('to_learn', 'in_progress', 'completed')),
  -- Una nota vacía se guarda como NULL (sin nota).
  add constraint user_repositories_notes_length
    check (notes is null or char_length(trim(notes)) between 1 and 2000);

create trigger user_repositories_set_updated_at
  before update on public.user_repositories
  for each row execute function public.set_updated_at();

-- Cada usuario solo puede modificar sus propios guardados...
create policy "Usuarios actualizan sus repositorios guardados"
  on public.user_repositories for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ...y de ellos solo el estado y la nota (nunca el usuario ni el repositorio).
grant update (status, notes) on public.user_repositories to authenticated;

-- Etiquetas del usuario ----------------------------------------------------

create table public.user_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint user_tags_name_length check (char_length(name) between 1 and 30),
  -- El nombre llega ya normalizado: sin espacios al principio/final ni espacios repetidos.
  constraint user_tags_name_normalized check (name = regexp_replace(btrim(name), '\s+', ' ', 'g'))
);

-- Sin duplicados por mayúsculas: "React" y "react" son la misma etiqueta.
create unique index user_tags_user_name_key on public.user_tags (user_id, lower(name));

-- Etiquetas asignadas a cada repositorio guardado.
-- Borrar una etiqueta o un guardado borra solo sus asociaciones (CASCADE), nunca el otro lado.
create table public.user_repository_tags (
  user_repository_id uuid not null references public.user_repositories (id) on delete cascade,
  tag_id uuid not null references public.user_tags (id) on delete cascade,
  primary key (user_repository_id, tag_id)
);

create index user_repository_tags_tag_id_idx on public.user_repository_tags (tag_id);

-- Row Level Security --------------------------------------------------------

alter table public.user_tags enable row level security;
alter table public.user_repository_tags enable row level security;

create policy "Usuarios gestionan sus etiquetas"
  on public.user_tags for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Usuarios ven las etiquetas de sus guardados"
  on public.user_repository_tags for select
  to authenticated
  using (
    exists (
      select 1 from public.user_repositories
      where user_repositories.id = user_repository_tags.user_repository_id
        and user_repositories.user_id = (select auth.uid())
    )
  );

-- Para etiquetar, tanto el guardado como la etiqueta deben ser del usuario.
create policy "Usuarios etiquetan sus guardados"
  on public.user_repository_tags for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_repositories
      where user_repositories.id = user_repository_tags.user_repository_id
        and user_repositories.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.user_tags
      where user_tags.id = user_repository_tags.tag_id
        and user_tags.user_id = (select auth.uid())
    )
  );

create policy "Usuarios quitan etiquetas de sus guardados"
  on public.user_repository_tags for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_repositories
      where user_repositories.id = user_repository_tags.user_repository_id
        and user_repositories.user_id = (select auth.uid())
    )
  );

-- Permisos de tabla (mínimo privilegio, igual que en table_grants) --------

revoke all on public.user_tags, public.user_repository_tags from anon, authenticated;

-- Etiquetas: ver, crear, renombrar y eliminar.
grant select, insert, delete on public.user_tags to authenticated;
grant update (name) on public.user_tags to authenticated;

-- Asociaciones: ver, añadir y quitar.
grant select, insert, delete on public.user_repository_tags to authenticated;

grant all on public.user_tags, public.user_repository_tags to service_role;
