import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSavedRepos, removeRepo, saveRepo } from '../services/savedReposService'

export function useSavedRepos() {
  const [savedRepos, setSavedRepos] = useState([])

  useEffect(() => {
    let isActive = true

    getSavedRepos().then((repos) => {
      if (isActive) setSavedRepos(repos)
    })

    return () => {
      isActive = false
    }
  }, [])

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

  return { savedRepos, isSaved, toggleSave }
}
