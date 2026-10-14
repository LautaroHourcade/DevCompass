import { getRepositoryStats } from '../services/statsService'
import { useLoadedData } from './useLoadedData'

const NO_SNAPSHOTS = []

/** Historial de estadísticas de un repositorio guardado (por su id de GitHub). */
export function useRepositoryStats(githubId) {
  const { data, isLoading, error, reload } = useLoadedData(githubId, () => getRepositoryStats(githubId), NO_SNAPSHOTS)

  const status = isLoading ? 'loading' : error ? 'error' : 'success'
  return { status, snapshots: data, error, reload }
}
