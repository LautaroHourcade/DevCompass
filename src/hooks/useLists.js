import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addRepoToList,
  createList,
  deleteList,
  getLists,
  removeRepoFromList,
  updateList,
} from '../services/listsService'

/**
 * Listas del usuario indicado. Sin usuario la lista está vacía.
 * Tras cada cambio se recargan desde la base de datos para no desincronizarse.
 */
export function useLists(userId) {
  const [lists, setLists] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLists(await getLists())
  }, [])

  useEffect(() => {
    let isActive = true

    setLists([])
    if (!userId) return

    setIsLoading(true)
    getLists()
      .then((loaded) => {
        if (isActive) setLists(loaded)
      })
      .catch(() => {
        if (isActive) setLists([])
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [userId])

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
    }),
    [withRefresh],
  )

  return { lists, isLoading, refresh, ...actions }
}
