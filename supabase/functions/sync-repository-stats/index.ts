// Captura las estadísticas (stars, forks, issues abiertos) de los repositorios seguidos.
// Corre en Supabase (Deno) con service_role: el navegador nunca escribe estadísticas.
//
// Dos formas de llamarla (POST):
// 1. Tarea diaria (Supabase Cron): cabecera x-cron-secret. Procesa todos los repositorios
//    guardados que aún no tienen captura hoy, cada uno una sola vez.
// 2. Captura bajo demanda de un repositorio que el usuario tiene guardado.
//    Body { repositoryId }. Solo se acepta si ese usuario tiene el repositorio guardado.
//    (Al guardar, la primera captura ya la registra save-repository.)
// El código común con save-repository está en ../_shared/github.ts.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse, syncRepository, type TrackedRepository } from '../_shared/github.ts'

// Peticiones a GitHub en paralelo: rápido sin saturar la API.
const CONCURRENCY = 5

/** Procesa la lista con varias peticiones a la vez. Si GitHub corta por límite, se para. */
async function syncAll(admin: SupabaseClient, repos: TrackedRepository[]) {
  const summary = { total: repos.length, captured: 0, problems: 0, skipped: 0 }
  let nextIndex = 0
  let isRateLimited = false

  async function worker() {
    while (nextIndex < repos.length && !isRateLimited) {
      const repo = repos[nextIndex++]
      const result = await syncRepository(admin, repo)

      if (result === 'captured') summary.captured++
      else summary.problems++
      if (result === 'rate_limited') isRateLimited = true
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  // Los que no se llegaron a procesar se capturarán en la siguiente ejecución.
  summary.skipped = summary.total - summary.captured - summary.problems
  return summary
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido.' }, 405)
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // 1. Tarea diaria ------------------------------------------------------------
  const cronSecret = request.headers.get('x-cron-secret')
  if (cronSecret) {
    const { data: isValid } = await admin.rpc('is_valid_cron_secret', { candidate: cronSecret })
    if (!isValid) return jsonResponse({ error: 'No autorizado.' }, 401)

    const { data: repos, error } = await admin.rpc('repositories_pending_sync')
    if (error) return jsonResponse({ error: 'No se pudieron leer los repositorios.' }, 500)

    const summary = await syncAll(admin, repos as TrackedRepository[])
    console.log('Sincronización diaria', summary)
    return jsonResponse(summary, 200)
  }

  // 2. Captura inicial al guardar ----------------------------------------------
  const token = (request.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const {
    data: { user },
  } = await admin.auth.getUser(token)

  if (!token || !user) return jsonResponse({ error: 'Sesión no válida.' }, 401)

  const body = await request.json().catch(() => ({}))
  const repositoryId = typeof body.repositoryId === 'string' ? body.repositoryId : ''

  // Solo se captura un repositorio que este usuario tiene guardado (nunca un id cualquiera).
  const { data: saved } = await admin
    .from('user_repositories')
    .select('repositories(id, github_id)')
    .eq('user_id', user.id)
    .eq('repository_id', repositoryId)
    .maybeSingle()

  if (!saved?.repositories) return jsonResponse({ error: 'Repositorio no encontrado.' }, 404)

  const result = await syncRepository(admin, saved.repositories as unknown as TrackedRepository)
  return jsonResponse({ result }, result === 'captured' ? 200 : 502)
})
