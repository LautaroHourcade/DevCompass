-- Comprobación de aislamiento entre usuarios (Row Level Security).
--
-- Simula a un usuario "intruso" con sesión (rol authenticated y un id que no es el de nadie) e intenta
-- leer y modificar los datos de otro usuario ("víctima"). Cada comprobación lanza un error si la
-- base de datos se lo permitiera. Todo ocurre dentro de una transacción que se deshace al final:
-- no deja ningún dato.
--
-- Uso: ejecutar el archivo completo en el SQL Editor de Supabase (o con execute_sql). Necesita que
-- exista al menos un usuario con un repositorio guardado. Si todo va bien, devuelve 'RLS OK'.

begin;

-- 1. Datos de la víctima (se leen como administrador, antes de cambiar de rol) ----------------
select set_config('test.victim_user', (select user_id::text from public.user_repositories limit 1), true);
select set_config('test.victim_saved', (select id::text from public.user_repositories limit 1), true);
select set_config('test.repository', (select repository_id::text from public.user_repositories limit 1), true);

-- 2. A partir de aquí somos el intruso ----------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

do $$
declare
  victim_user uuid := current_setting('test.victim_user')::uuid;
  victim_saved uuid := current_setting('test.victim_saved')::uuid;
  repository uuid := current_setting('test.repository')::uuid;
  affected integer;
begin
  -- Lectura: el intruso no ve nada de la víctima.
  if exists (select 1 from public.user_repositories) then
    raise exception 'FALLO: el intruso ve repositorios guardados de otros usuarios';
  end if;
  if exists (select 1 from public.user_tags) then
    raise exception 'FALLO: el intruso ve etiquetas de otros usuarios';
  end if;
  if exists (select 1 from public.user_repository_tags) then
    raise exception 'FALLO: el intruso ve etiquetas asignadas de otros usuarios';
  end if;
  if exists (select 1 from public.lists) or exists (select 1 from public.list_repositories) or exists (select 1 from public.list_tags) then
    raise exception 'FALLO: el intruso ve listas de otros usuarios';
  end if;
  if exists (select 1 from public.repository_stats) then
    raise exception 'FALLO: el intruso ve el historial de repositorios que no ha guardado';
  end if;
  -- El registro interno ni siquiera se puede consultar (sin permiso de lectura para usuarios).
  begin
    perform 1 from public.repository_sync_log;
    raise exception 'FALLO: el intruso puede consultar el registro interno de sincronización';
  exception when insufficient_privilege then
    null; -- esperado: "permission denied for table repository_sync_log"
  end;

  -- Modificación de notas y estados de la víctima: 0 filas afectadas.
  update public.user_repositories set notes = 'hackeado', status = 'completed' where id = victim_saved;
  get diagnostics affected = row_count;
  if affected > 0 then
    raise exception 'FALLO: el intruso modificó la nota o el estado de otro usuario';
  end if;

  delete from public.user_repositories where id = victim_saved;
  get diagnostics affected = row_count;
  if affected > 0 then
    raise exception 'FALLO: el intruso borró un repositorio guardado de otro usuario';
  end if;

  -- Guardar un repositorio en nombre de la víctima: lo impide la política (with check).
  begin
    insert into public.user_repositories (user_id, repository_id) values (victim_user, repository);
    raise exception 'FALLO: el intruso guardó un repositorio en la colección de otro usuario';
  exception when insufficient_privilege then
    null; -- esperado: "new row violates row-level security policy"
  end;

  -- Caché compartida: solo lectura para los usuarios (la escribe el servidor).
  begin
    update public.repositories set html_url = 'https://ejemplo-malicioso.test' where id = repository;
    raise exception 'FALLO: el intruso modificó la caché compartida de repositorios';
  exception when insufficient_privilege then
    null; -- esperado: "permission denied for table repositories"
  end;

  begin
    insert into public.repositories (github_id, name, full_name, html_url) values (1, 'x', 'x/x', 'https://x.test');
    raise exception 'FALLO: el intruso insertó en la caché compartida de repositorios';
  exception when insufficient_privilege then
    null;
  end;

  -- Historial: solo lo escribe el servidor.
  begin
    insert into public.repository_stats (repository_id, stars, forks, open_issues) values (repository, 1, 1, 1);
    raise exception 'FALLO: el intruso escribió capturas de estadísticas';
  exception when insufficient_privilege then
    null;
  end;
end
$$;

-- 3. El dueño sí puede leer y editar lo suyo (las políticas no restringen de más) ----------------
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.victim_user'), 'role', 'authenticated')::text, true);

do $$
declare
  victim_saved uuid := current_setting('test.victim_saved')::uuid;
  affected integer;
begin
  if not exists (select 1 from public.user_repositories where id = victim_saved) then
    raise exception 'FALLO: el dueño no ve su propio repositorio guardado';
  end if;
  if not exists (select 1 from public.repositories) then
    raise exception 'FALLO: el dueño no puede leer la caché de repositorios';
  end if;

  update public.user_repositories set notes = 'nota de prueba' where id = victim_saved;
  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'FALLO: el dueño no puede editar su nota';
  end if;
end
$$;

select 'RLS OK' as resultado;

rollback;
