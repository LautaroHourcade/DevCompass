import { getStatsForRepositories } from '../services/statsService'
import { useLoadedData } from './useLoadedData'

const NO_STATS = new Map()

/** Historial de estadísticas de los repositorios que se comparan (por su id de GitHub). */
export function useComparisonStats(githubIds) {
  // Una cadena estable como clave: el array cambia de identidad en cada render.
  const idsKey = [...githubIds].sort((a, b) => a - b).join(',')

  const { data, isLoading, error, reload } = useLoadedData(
    idsKey,
    () => getStatsForRepositories(idsKey ? idsKey.split(',').map(Number) : []),
    NO_STATS,
  )

  const status = isLoading ? 'loading' : error ? 'error' : 'success'
  return { status, statsByRepo: data, error, reload }
}
