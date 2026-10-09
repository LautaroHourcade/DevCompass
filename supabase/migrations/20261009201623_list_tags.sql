-- Etiquetas de las listas: clasifican una lista (no cambian qué repositorios contiene).
-- Borrar una lista o una etiqueta borra solo la asociación (CASCADE), nunca el otro lado.

create table public.list_tags (
  list_id uuid not null references public.lists (id) on delete cascade,
  tag_id uuid not null references public.user_tags (id) on delete cascade,
  primary key (list_id, tag_id)
);

create index list_tags_tag_id_idx on public.list_tags (tag_id);

-- Row Level Security --------------------------------------------------------

alter table public.list_tags enable row level security;

create policy "Usuarios ven las etiquetas de sus listas"
  on public.list_tags for select
  to authenticated
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_tags.list_id and lists.user_id = (select auth.uid())
    )
  );

-- Para etiquetar, tanto la lista como la etiqueta deben ser del usuario.
create policy "Usuarios etiquetan sus listas"
  on public.list_tags for insert
  to authenticated
  with check (
    exists (
      select 1 from public.lists
      where lists.id = list_tags.list_id and lists.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.user_tags
      where user_tags.id = list_tags.tag_id and user_tags.user_id = (select auth.uid())
    )
  );

create policy "Usuarios quitan etiquetas de sus listas"
  on public.list_tags for delete
  to authenticated
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_tags.list_id and lists.user_id = (select auth.uid())
    )
  );

-- Permisos de tabla (mínimo privilegio) -------------------------------------

revoke all on public.list_tags from anon, authenticated;
grant select, insert, delete on public.list_tags to authenticated;
grant all on public.list_tags to service_role;
