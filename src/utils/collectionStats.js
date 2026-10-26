// Cálculos sobre la colección de repositorios guardados (para el Panel).
// Funciones puras: reciben la lista de useSavedRepos y no tocan la red.
import { STATUS_OPTIONS } from '../constants/repoStatus'

// Valor interno para repositorios sin lenguaje; la interfaz lo muestra traducido (dashboard.unknownLanguage).
export const UNKNOWN_LANGUAGE = 'unknown'

/** Cuántos repositorios hay en cada estado: [{ ...opción de estado, count }]. */
export function countByStatus(repos) {
  return STATUS_OPTIONS.map((option) => ({
    ...option,
    count: repos.filter((repo) => repo.status === option.value).length,
  }))
}

/**
 * Distribución por lenguaje principal, de más a menos repositorios.
 * Devuelve [{ name, count, percentage }] (percentage sobre el total de la colección).
 */
export function getLanguageDistribution(repos) {
  if (repos.length === 0) return []

  const counts = new Map()
  repos.forEach((repo) => {
    const language = repo.language || UNKNOWN_LANGUAGE
    counts.set(language, (counts.get(language) ?? 0) + 1)
  })

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, percentage: (count / repos.length) * 100 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/** Estadísticas agregadas que tienen sentido para una colección. */
export function getCollectionTotals(repos) {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0)
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks, 0)
  const mostStarred = repos.reduce((best, repo) => (!best || repo.stars > best.stars ? repo : best), null)
  const usedTagIds = new Set(repos.flatMap((repo) => repo.tagIds))

  return {
    totalStars,
    totalForks,
    averageStars: repos.length > 0 ? Math.round(totalStars / repos.length) : 0,
    mostStarred,
    withNotes: repos.filter((repo) => repo.notes).length,
    usedTags: usedTagIds.size,
    languageCount: new Set(repos.map((repo) => repo.language).filter(Boolean)).size,
  }
}

function newestFirst(repos, dateKey, limit) {
  return repos
    .filter((repo) => repo[dateKey])
    .toSorted((a, b) => new Date(b[dateKey]) - new Date(a[dateKey]))
    .slice(0, limit)
}

/** Los últimos repositorios que el usuario ha guardado. */
export function getRecentlySaved(repos, limit) {
  return newestFirst(repos, 'savedAt', limit)
}

/** Los repositorios con actividad más reciente en GitHub (último push). */
export function getRecentlyUpdated(repos, limit) {
  return newestFirst(repos, 'updatedAt', limit)
}
