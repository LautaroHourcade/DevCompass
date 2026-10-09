import { DEFAULT_QUERY } from '../constants/filters'
import { getDateDaysAgo } from '../utils/formatters'

// El frontend nunca habla directamente con api.github.com: pasa por la Edge Function
// github-proxy de Supabase, que añade el token (secreto del servidor, nunca en el navegador).
const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-proxy`

export const RESULTS_PER_PAGE = 24

// La API de búsqueda de GitHub solo devuelve los primeros 1000 resultados.
const MAX_SEARCH_RESULTS = 1000

export class GitHubApiError extends Error {
  constructor(message, { status, resetAt = null } = {}) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
    this.resetAt = resetAt
  }
}

async function request(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal,
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (!response.ok) {
    throw createApiError(response)
  }

  return response.json()
}

function createApiError(response) {
  const remaining = response.headers.get('x-ratelimit-remaining')
  const reset = response.headers.get('x-ratelimit-reset')
  const isRateLimited = (response.status === 403 || response.status === 429) && remaining === '0'

  if (isRateLimited) {
    const resetAt = reset ? new Date(Number(reset) * 1000) : null
    return new GitHubApiError('Has alcanzado el límite de búsquedas de GitHub.', {
      status: response.status,
      resetAt,
    })
  }

  if (response.status === 422) {
    return new GitHubApiError('La búsqueda no es válida. Prueba con otros términos o filtros.', {
      status: response.status,
    })
  }

  if (response.status === 404) {
    return new GitHubApiError('No se ha encontrado el repositorio.', { status: response.status })
  }

  return new GitHubApiError('No se pudo conectar con GitHub. Inténtalo de nuevo.', {
    status: response.status,
  })
}

/**
 * Convierte el texto y los filtros del usuario en la sintaxis de búsqueda de GitHub.
 * Ej: "react language:typescript stars:>=500 pushed:>=2024-01-01 license:mit"
 */
export function buildSearchQuery(text, filters) {
  const parts = []

  if (text.trim()) parts.push(text.trim())
  if (filters.language) parts.push(`language:${filters.language}`)
  if (filters.minStars) parts.push(`stars:>=${filters.minStars}`)
  if (filters.minForks) parts.push(`forks:>=${filters.minForks}`)
  if (filters.updatedWithin) parts.push(`pushed:>=${getDateDaysAgo(filters.updatedWithin)}`)
  if (filters.license) parts.push(`license:${filters.license}`)

  return parts.length > 0 ? parts.join(' ') : DEFAULT_QUERY
}

/** Traduce un repositorio de la API a la forma que usa la aplicación. */
export function mapRepository(apiRepo) {
  return {
    id: apiRepo.id,
    name: apiRepo.name,
    fullName: apiRepo.full_name,
    description: apiRepo.description ?? '',
    language: apiRepo.language,
    stars: apiRepo.stargazers_count,
    forks: apiRepo.forks_count,
    openIssues: apiRepo.open_issues_count,
    updatedAt: apiRepo.pushed_at ?? apiRepo.updated_at,
    createdAt: apiRepo.created_at,
    license: getLicenseName(apiRepo.license),
    topics: apiRepo.topics ?? [],
    homepage: apiRepo.homepage ?? '',
    url: apiRepo.html_url,
    owner: {
      login: apiRepo.owner.login,
      avatarUrl: apiRepo.owner.avatar_url,
      url: apiRepo.owner.html_url,
    },
  }
}

function getLicenseName(license) {
  if (!license) return null
  if (license.spdx_id && license.spdx_id !== 'NOASSERTION') return license.spdx_id
  return 'Otra'
}

export async function searchRepositories({ query, sort, page = 1, signal }) {
  const params = new URLSearchParams({
    q: query,
    per_page: String(RESULTS_PER_PAGE),
    page: String(page),
  })

  if (sort && sort !== 'best-match') {
    params.set('sort', sort)
    params.set('order', 'desc')
  }

  const data = await request(`/search/repositories?${params}`, signal)
  const reachableResults = Math.min(data.total_count, MAX_SEARCH_RESULTS)

  return {
    items: data.items.map(mapRepository),
    totalCount: data.total_count,
    hasMore: page * RESULTS_PER_PAGE < reachableResults,
  }
}

/**
 * Lenguajes de un repositorio con su porcentaje, ordenados de mayor a menor.
 * Ej: [{ name: 'TypeScript', percentage: 82.4 }, ...]
 *
 * Se usa el id y no "owner/nombre" porque el id no cambia si el repositorio
 * se renombra (con el nombre, GitHub responde con una redirección).
 */
export async function getRepositoryLanguages(repoId, signal) {
  const data = await request(`/repositories/${repoId}/languages`, signal)
  const totalBytes = Object.values(data).reduce((sum, bytes) => sum + bytes, 0)

  if (totalBytes === 0) return []

  return Object.entries(data)
    .map(([name, bytes]) => ({ name, percentage: (bytes / totalBytes) * 100 }))
    .sort((a, b) => b.percentage - a.percentage)
}
