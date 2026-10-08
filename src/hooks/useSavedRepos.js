import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSavedRepos, removeRepo, saveRepo } from '../services/savedReposService'

/** Repositorios guardados del usuario indicado. Sin usuario (userId vacío) la lista está vacía. */
export function useSavedRepos(userId) {
  const [savedRepos, setSavedRepos] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isActive = true

    // Al cambiar de usuario, vaciamos la lista anterior antes de cargar la nueva.
    setSavedRepos([])
    if (!userId) return

    setIsLoading(true)
    getSavedRepos()
      .then((repos) => {
        if (isActive) setSavedRepos(repos)
      })
      .catch(() => {
        if (isActive) setSavedRepos([])
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [userId])

  const savedIds = useMemo(() => new Set(savedRepos.map((repo) => repo.id)), [savedRepos])

  const isSaved = useCallback((repoId) => savedIds.has(repoId), [savedIds])

  /** Guarda o quita el repositorio. Devuelve true si ha quedado guardado. */
  const toggleSave = useCallback(
    async (repo) => {
      if (savedIds.has(repo.id)) {
        setSavedRepos(await removeRepo(repo.id))
        return false
      }

      setSavedRepos(await saveRepo(repo))
      return true
    },
    [savedIds],
  )

  return { savedRepos, isLoading, isSaved, toggleSave }
}
