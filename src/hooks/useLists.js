import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addRepoToList,
  addTagToList,
  createList,
  deleteList,
  getLists,
  removeRepoFromList,
  removeTagFromList,
  updateList,
} from '../services/listsService'

/**
 * Listas del usuario indicado. Sin usuario la lista está vacía.
 * Tras cada cambio se recargan desde la base de datos para no desincronizarse.
 */
export function useLists(userId) {
  const [lists, setLists] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  // Si la carga falla guardamos el error para mostrarlo (no una colección vacía engañosa).
  const [loadError, setLoadError] = useState(null)
  // Cambiar reloadKey vuelve a lanzar la carga (botón "Reintentar").
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(async () => {
    setLists(await getLists())
  }, [])

  useEffect(() => {
    let isActive = true

    setLists([])
    setLoadError(null)
    if (!userId) return

    setIsLoading(true)
    getLists()
      .then((loaded) => {
        if (isActive) setLists(loaded)
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

  // Envuelve una operación del servicio para recargar las listas al terminar.
  const withRefresh = useCallback(
    (operation) =>
      async (...args) => {
        await operation(...args)
        await refresh()
      },
    [refresh],
  )

  // Memorizadas para que no cambien en cada render.
  const actions = useMemo(
    () => ({
      createList: withRefresh(createList),
      updateList: withRefresh(updateList),
      deleteList: withRefresh(deleteList),
      addRepoToList: withRefresh(addRepoToList),
      removeRepoFromList: withRefresh(removeRepoFromList),
      addTagToList: withRefresh(addTagToList),
      removeTagFromList: withRefresh(removeTagFromList),
    }),
    [withRefresh],
  )

  return { lists, isLoading, loadError, reload, refresh, ...actions }
}
