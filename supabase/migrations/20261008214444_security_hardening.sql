-- Endurecimiento de seguridad.

-- rls_auto_enable() la crea Supabase (opción "activar RLS automáticamente") como event trigger.
-- Solo debe ejecutarla el propio trigger, nunca la API pública.
-- Se comprueba que exista porque no todos los proyectos la tienen.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;

-- La tabla repositories es una caché compartida que cualquier usuario autenticado puede escribir.
-- Estas restricciones impiden que alguien cambie los enlaces por webs ajenas a GitHub.
alter table public.repositories
  add constraint repositories_html_url_github
    check (html_url like 'https://github.com/%'),
  add constraint repositories_owner_avatar_url_github
    check (owner_avatar_url is null or owner_avatar_url like 'https://avatars.githubusercontent.com/%');
