import { useCallback, useEffect, useState } from 'react'
import { getRepositoryStats } from '../services/statsService'

/** Historial de estadísticas de un repositorio guardado (por su id de GitHub). */
export function useRepositoryStats(githubId) {
  const [state, setState] = useState({ status: 'loading', snapshots: [], error: null })
  // Cambiar reloadKey vuelve a lanzar la carga (botón "Reintentar").
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    setState({ status: 'loading', snapshots: [], error: null })
    getRepositoryStats(githubId)
      .then((snapshots) => {
        if (isActive) setState({ status: 'success', snapshots, error: null })
      })
      .catch((error) => {
        if (isActive) setState({ status: 'error', snapshots: [], error })
      })

    return () => {
      isActive = false
    }
  }, [githubId, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { ...state, reload }
}
