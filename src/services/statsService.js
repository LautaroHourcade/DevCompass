// Historial de estadísticas de los repositorios guardados (tabla repository_stats).
// Las capturas las escribe solo el servidor (Edge Function sync-repository-stats);
// desde aquí solo se leen.
import { supabase } from '../lib/supabase'

function toAppSnapshot(row) {
  return {
    stars: row.stars,
    forks: row.forks,
    openIssues: row.open_issues,
    capturedAt: row.captured_at,
  }
}

/** Capturas de un repositorio (por su id de GitHub), de la más antigua a la más reciente. */
export async function getRepositoryStats(githubId) {
  const { data, error } = await supabase
    .from('repository_stats')
    .select('stars, forks, open_issues, captured_at, repositories!inner(github_id)')
    .eq('repositories.github_id', githubId)
    .order('captured_at', { ascending: true })

  if (error) throw new Error('No se pudo cargar el historial de estadísticas.')

  return data.map(toAppSnapshot)
}

/**
 * Capturas de varios repositorios a la vez (para la comparación), en una sola consulta.
 * Devuelve un Map: id de GitHub -> capturas de la más antigua a la más reciente.
 */
export async function getStatsForRepositories(githubIds) {
  const statsByRepo = new Map(githubIds.map((githubId) => [githubId, []]))
  if (githubIds.length === 0) return statsByRepo

  const { data, error } = await supabase
    .from('repository_stats')
    .select('stars, forks, open_issues, captured_at, repositories!inner(github_id)')
    .in('repositories.github_id', githubIds)
    .order('captured_at', { ascending: true })

  if (error) throw new Error('No se pudo cargar el historial de estadísticas.')

  data.forEach((row) => {
    statsByRepo.get(row.repositories.github_id)?.push(toAppSnapshot(row))
  })

  return statsByRepo
}
