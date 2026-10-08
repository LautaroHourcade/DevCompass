-- Permisos de tabla (GRANT). RLS decide QUÉ filas ve cada usuario, pero sin GRANT
-- Postgres rechaza la operación completa. Se da a cada rol solo lo que necesita
-- (principio de mínimo privilegio).

-- Los visitantes sin sesión no acceden a ninguna tabla.
revoke all on public.repositories, public.user_repositories, public.lists, public.list_repositories
  from anon;

-- TRUNCATE ignora RLS y vaciaría la tabla entera: ningún usuario debe tenerlo.
revoke truncate, references, trigger
  on public.repositories, public.user_repositories, public.lists, public.list_repositories
  from authenticated;

-- Caché compartida: leer, insertar y refrescar datos de GitHub. Nunca borrar.
grant select, insert, update on public.repositories to authenticated;

-- Guardados: ver, guardar y quitar (no se editan).
grant select, insert, delete on public.user_repositories to authenticated;

-- Listas: crear, ver, editar y eliminar.
grant select, insert, update, delete on public.lists to authenticated;

-- Repos dentro de una lista: ver, añadir y quitar.
grant select, insert, delete on public.list_repositories to authenticated;

-- service_role (solo en el servidor, p. ej. Edge Functions) tiene acceso completo.
grant all on public.repositories, public.user_repositories, public.lists, public.list_repositories
  to service_role;
