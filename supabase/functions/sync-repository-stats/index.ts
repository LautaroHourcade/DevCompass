// Captura las estadísticas (stars, forks, issues abiertos) de los repositorios seguidos.
// Corre en Supabase (Deno) con service_role: el navegador nunca escribe estadísticas.
//
// Dos formas de llamarla (POST):
// 1. Tarea diaria (Supabase Cron): cabecera x-cron-secret. Procesa todos los repositorios
//    guardados que aún no tienen captura hoy, cada uno una sola vez.
// 2. Captura inicial: un usuario con sesión acaba de guardar un repositorio.
//    Body { repositoryId }. Solo se acepta si ese usuario tiene el repositorio guardado.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

const GITHUB_API_URL = 'https://api.github.com'
// Peticiones a GitHub en paralelo: rápido sin saturar la API.
const CONCURRENCY = 5

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type TrackedRepository = { id: string; github_id: number }

type SyncResult = 'captured' | 'github_error' | 'rate_limited' | 'not_found'

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getGitHubHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'DevCompass',
  }
  const token = Deno.env.get('GITHUB_TOKEN')
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

/** Registra un problema. Nunca toca el historial existente. */
async function logProblem(
  admin: SupabaseClient,
  repositoryId: string,
  problem: Exclude<SyncResult, 'captured'>,
  httpStatus: number | null,
  message: string,
) {
  const { error } = await admin
    .from('repository_sync_log')
    .insert({ repository_id: repositoryId, problem, http_status: httpStatus, message })

  if (error) console.error('No se pudo registrar el problema', repositoryId, error.message)
}

/** Pide los datos actuales a GitHub y guarda la captura del día. */
async function syncRepository(admin: SupabaseClient, repo: TrackedRepository): Promise<SyncResult> {
  let response: Response
  try {
    response = await fetch(`${GITHUB_API_URL}/repositories/${repo.github_id}`, { headers: getGitHubHeaders() })
  } catch (error) {
    await logProblem(admin, repo.id, 'github_error', null, `GitHub no responde: ${error}`)
    return 'github_error'
  }

  if (!response.ok) {
    const isRateLimited =
      (response.status === 403 || response.status === 429) && response.headers.get('x-ratelimit-remaining') === '0'

    if (isRateLimited) {
      await logProblem(admin, repo.id, 'rate_limited', response.status, 'Límite de peticiones de GitHub alcanzado.')
      return 'rate_limited'
    }

    // 404: borrado o privado. 451: bloqueado por motivos legales.
    if (response.status === 404 || response.status === 451) {
      await logProblem(admin, repo.id, 'not_found', response.status, 'El repositorio ya no está disponible en GitHub.')
      return 'not_found'
    }

    await logProblem(admin, repo.id, 'github_error', response.status, `GitHub respondió con el estado ${response.status}.`)
    return 'github_error'
  }

  const data = await response.json()
  const stats = {
    stars: data.stargazers_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
  }

  // ignoreDuplicates: si ya hay captura hoy (UNIQUE repository_id + captured_on), no se duplica.
  const { error: insertError } = await admin
    .from('repository_stats')
    .upsert({ repository_id: repo.id, ...stats }, { onConflict: 'repository_id,captured_on', ignoreDuplicates: true })

  if (insertError) {
    await logProblem(admin, repo.id, 'github_error', null, `No se pudo guardar la captura: ${insertError.message}`)
    return 'github_error'
  }

  // La caché de repositorios también se actualiza para que las tarjetas muestren datos al día.
  await admin
    .from('repositories')
    .update({ ...stats, updated_at: data.pushed_at ?? data.updated_at, synced_at: new Date().toISOString() })
    .eq('id', repo.id)

  return 'captured'
}

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
