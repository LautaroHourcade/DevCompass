-- Historial de estadísticas de los repositorios seguidos (stars, forks, issues abiertos).
-- Las capturas las escribe solo el servidor (Edge Function sync-repository-stats con service_role):
-- así nadie puede inventarse datos desde el navegador.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Capturas ----------------------------------------------------------------

create table public.repository_stats (
  id bigint generated always as identity primary key,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  stars integer not null check (stars >= 0),
  forks integer not null check (forks >= 0),
  open_issues integer not null check (open_issues >= 0),
  captured_at timestamptz not null default now(),
  -- Día (UTC) de la captura: lo calcula la base de datos.
  captured_on date generated always as ((captured_at at time zone 'UTC')::date) stored,
  -- Como mucho una captura al día por repositorio, aunque la tarea se ejecute dos veces.
  constraint repository_stats_repository_day_key unique (repository_id, captured_on)
);

-- Problemas al sincronizar (GitHub caído, límite alcanzado, repositorio no disponible).
-- Registrar un problema nunca borra el historial existente.
create table public.repository_sync_log (
  id bigint generated always as identity primary key,
  repository_id uuid references public.repositories (id) on delete cascade,
  problem text not null check (problem in ('github_error', 'rate_limited', 'not_found')),
  http_status integer,
  message text,
  logged_at timestamptz not null default now()
);

create index repository_sync_log_repository_id_idx on public.repository_sync_log (repository_id);
create index repository_sync_log_logged_at_idx on public.repository_sync_log (logged_at desc);

-- Row Level Security --------------------------------------------------------

alter table public.repository_stats enable row level security;
alter table public.repository_sync_log enable row level security;

-- Cada usuario ve el historial de los repositorios que tiene guardados.
create policy "Usuarios ven el historial de sus repositorios guardados"
  on public.repository_stats for select
  to authenticated
  using (
    exists (
      select 1 from public.user_repositories
      where user_repositories.repository_id = repository_stats.repository_id
        and user_repositories.user_id = (select auth.uid())
    )
  );

-- El registro de problemas es interno: sin políticas, solo service_role puede leerlo.

revoke all on public.repository_stats, public.repository_sync_log from anon, authenticated;
grant select on public.repository_stats to authenticated;
grant all on public.repository_stats, public.repository_sync_log to service_role;

-- Funciones para la tarea diaria (solo service_role) ------------------------

-- Repositorios guardados por al menos un usuario y sin captura hoy.
-- Cada repositorio aparece una sola vez, lo tengan guardado 1 o 1000 usuarios.
create function public.repositories_pending_sync()
returns table (id uuid, github_id bigint)
language sql
stable
set search_path = ''
as $$
  select r.id, r.github_id
  from public.repositories r
  where exists (select 1 from public.user_repositories ur where ur.repository_id = r.id)
    and not exists (
      select 1 from public.repository_stats s
      where s.repository_id = r.id
        and s.captured_on = (now() at time zone 'UTC')::date
    )
  order by r.id;
$$;

-- Comprueba el secreto que envía el cron. El secreto vive en Vault y nunca sale de la base de datos.
create function public.is_valid_cron_secret(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'sync_stats_cron_secret' and decrypted_secret = candidate
  );
$$;

revoke execute on function public.repositories_pending_sync() from public, anon, authenticated;
revoke execute on function public.is_valid_cron_secret(text) from public, anon, authenticated;
grant execute on function public.repositories_pending_sync() to service_role;
grant execute on function public.is_valid_cron_secret(text) to service_role;

-- Tarea programada: cada día a las 03:00 UTC llama a la Edge Function.
-- La URL del proyecto y el secreto se leen de Vault (ver README → "Estadísticas diarias").
select cron.schedule(
  'sync-repository-stats-daily',
  '0 3 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/sync-repository-stats',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'sync_stats_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
