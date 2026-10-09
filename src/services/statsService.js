// Historial de estadísticas de los repositorios guardados (tabla repository_stats).
// Las capturas las escribe solo el servidor (Edge Function sync-repository-stats);
// desde aquí solo se leen o se pide la captura inicial.
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
 * Pide al servidor la primera captura de un repositorio recién guardado,
 * para que su historial empiece hoy y no en la siguiente ejecución diaria.
 */
export async function requestInitialCapture(repositoryId) {
  const { error } = await supabase.functions.invoke('sync-repository-stats', {
    method: 'POST',
    body: { repositoryId },
  })

  if (error) throw new Error('No se pudo registrar la primera captura de estadísticas.')
}
