// Código compartido por las Edge Functions que leen repositorios de GitHub
// (sync-repository-stats y save-repository). Corre en el servidor con service_role.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const GITHUB_API_URL = 'https://api.github.com'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export type TrackedRepository = { id: string; github_id: number }

export type SyncProblem = 'github_error' | 'rate_limited' | 'not_found'
export type SyncResult = 'captured' | SyncProblem

// Datos del repositorio tal como los devuelve GitHub (solo los campos que usamos).
export type GitHubRepository = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  license: { spdx_id: string | null } | null
  owner: { login: string; avatar_url: string }
  pushed_at: string | null
  updated_at: string
  created_at: string
}

type FetchResult =
  | { ok: true; data: GitHubRepository }
  | { ok: false; problem: SyncProblem; httpStatus: number | null; message: string }

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

/** Pide un repositorio a GitHub por su id (el id no cambia aunque se renombre). */
export async function fetchGitHubRepository(githubId: number): Promise<FetchResult> {
  let response: Response
  try {
    response = await fetch(`${GITHUB_API_URL}/repositories/${githubId}`, { headers: getGitHubHeaders() })
  } catch (error) {
    return { ok: false, problem: 'github_error', httpStatus: null, message: `GitHub no responde: ${error}` }
  }

  if (response.ok) return { ok: true, data: await response.json() }

  const isRateLimited =
    (response.status === 403 || response.status === 429) && response.headers.get('x-ratelimit-remaining') === '0'
  if (isRateLimited) {
    return { ok: false, problem: 'rate_limited', httpStatus: response.status, message: 'Límite de peticiones de GitHub alcanzado.' }
  }

  // 404: borrado o privado. 451: bloqueado por motivos legales.
  if (response.status === 404 || response.status === 451) {
    return { ok: false, problem: 'not_found', httpStatus: response.status, message: 'El repositorio ya no está disponible en GitHub.' }
  }

  return { ok: false, problem: 'github_error', httpStatus: response.status, message: `GitHub respondió con el estado ${response.status}.` }
}

/** Misma regla que la app (githubService.getLicenseName): SPDX o "Otra". */
function getLicenseName(license: GitHubRepository['license']) {
  if (!license) return null
  if (license.spdx_id && license.spdx_id !== 'NOASSERTION') return license.spdx_id
  return 'Otra'
}

/** Fila de la tabla repositories construida SOLO con datos de GitHub (nunca del navegador). */
export function toRepositoryRow(data: GitHubRepository) {
  return {
    github_id: data.id,
    name: data.name,
    full_name: data.full_name,
    description: data.description || null,
    html_url: data.html_url,
    language: data.language,
    stars: data.stargazers_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
    license: getLicenseName(data.license),
    owner_login: data.owner.login,
    owner_avatar_url: data.owner.avatar_url,
    updated_at: data.pushed_at ?? data.updated_at,
    created_at: data.created_at,
    synced_at: new Date().toISOString(),
  }
}

/** Registra un problema. Nunca toca el historial existente. */
export async function logProblem(
  admin: SupabaseClient,
  repositoryId: string,
  problem: SyncProblem,
  httpStatus: number | null,
  message: string,
) {
  const { error } = await admin
    .from('repository_sync_log')
    .insert({ repository_id: repositoryId, problem, http_status: httpStatus, message })

  if (error) console.error('No se pudo registrar el problema', repositoryId, error.message)
}

/** Guarda la captura del día a partir de unos datos de GitHub ya obtenidos. */
export async function captureStats(admin: SupabaseClient, repositoryId: string, data: GitHubRepository): Promise<SyncResult> {
  const stats = {
    stars: data.stargazers_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
  }

  // ignoreDuplicates: si ya hay captura hoy (UNIQUE repository_id + captured_on), no se duplica.
  const { error: insertError } = await admin
    .from('repository_stats')
    .upsert({ repository_id: repositoryId, ...stats }, { onConflict: 'repository_id,captured_on', ignoreDuplicates: true })

  if (insertError) {
    await logProblem(admin, repositoryId, 'github_error', null, `No se pudo guardar la captura: ${insertError.message}`)
    return 'github_error'
  }

  // La caché de repositorios también se actualiza para que las tarjetas muestren datos al día.
  await admin
    .from('repositories')
    .update({ ...stats, updated_at: data.pushed_at ?? data.updated_at, synced_at: new Date().toISOString() })
    .eq('id', repositoryId)

  return 'captured'
}

/** Pide los datos actuales a GitHub y guarda la captura del día. */
export async function syncRepository(admin: SupabaseClient, repo: TrackedRepository): Promise<SyncResult> {
  const result = await fetchGitHubRepository(repo.github_id)

  if (!result.ok) {
    await logProblem(admin, repo.id, result.problem, result.httpStatus, result.message)
    return result.problem
  }

  return captureStats(admin, repo.id, result.data)
}
