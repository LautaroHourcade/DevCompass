import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteSavedRepoNote,
  getSavedRepos,
  removeRepo,
  saveRepo,
  updateSavedRepoNote,
  updateSavedRepoStatus,
} from '../services/savedReposService'
import { addTagToSavedRepo, removeTagFromSavedRepo } from '../services/tagsService'

/** Repositorios guardados del usuario indicado. Sin usuario (userId vacío) la lista está vacía. */
export function useSavedRepos(userId) {
  const [savedRepos, setSavedRepos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  // Si la carga falla guardamos el error para mostrarlo (no una colección vacía engañosa).
  const [loadError, setLoadError] = useState(null)
  // Cambiar reloadKey vuelve a lanzar la carga (botón "Reintentar").
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    // Al cambiar de usuario, vaciamos la lista anterior antes de cargar la nueva.
    setSavedRepos([])
    setLoadError(null)
    if (!userId) return

    setIsLoading(true)
    getSavedRepos()
      .then((repos) => {
        if (isActive) setSavedRepos(repos)
      })
      .catch((error) => {
        if (isActive) setLoadError(error)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [userId, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

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

  /**
   * Cambia un repositorio guardado en el estado local.
   * Solo se llama después de que Supabase confirme el cambio, así la interfaz refleja lo guardado.
   */
  const patchRepo = useCallback((savedId, getChanges) => {
    setSavedRepos((repos) => repos.map((repo) => (repo.savedId === savedId ? { ...repo, ...getChanges(repo) } : repo)))
  }, [])

  // Acciones de seguimiento: estado, nota y etiquetas. Lanzan un error si Supabase falla.
  const trackingActions = useMemo(
    () => ({
      updateStatus: async (savedId, status) => {
        await updateSavedRepoStatus(savedId, status)
        patchRepo(savedId, () => ({ status }))
      },
      updateNote: async (savedId, notes) => {
        const savedNotes = await updateSavedRepoNote(savedId, notes)
        patchRepo(savedId, () => ({ notes: savedNotes }))
      },
      deleteNote: async (savedId) => {
        await deleteSavedRepoNote(savedId)
        patchRepo(savedId, () => ({ notes: '' }))
      },
      addTag: async (savedId, tagId) => {
        await addTagToSavedRepo(savedId, tagId)
        patchRepo(savedId, (repo) => ({ tagIds: repo.tagIds.includes(tagId) ? repo.tagIds : [...repo.tagIds, tagId] }))
      },
      removeTag: async (savedId, tagId) => {
        await removeTagFromSavedRepo(savedId, tagId)
        patchRepo(savedId, (repo) => ({ tagIds: repo.tagIds.filter((id) => id !== tagId) }))
      },
      // Tras eliminar una etiqueta, la base de datos ya borró sus asignaciones: solo falta reflejarlo aquí.
      forgetTag: (tagId) => {
        setSavedRepos((repos) =>
          repos.map((repo) =>
            repo.tagIds.includes(tagId) ? { ...repo, tagIds: repo.tagIds.filter((id) => id !== tagId) } : repo,
          ),
        )
      },
    }),
    [patchRepo],
  )

  return { savedRepos, isLoading, loadError, reload, isSaved, toggleSave, ...trackingActions }
}
