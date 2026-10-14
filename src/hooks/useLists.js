import { useCallback, useMemo } from 'react'
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
import { useLoadedData } from './useLoadedData'

const NO_LISTS = []

/**
 * Listas del usuario indicado. Sin usuario la lista está vacía.
 * Tras cada cambio se recargan desde la base de datos para no desincronizarse.
 */
export function useLists(userId) {
  // Si la carga falla, loadError guarda el error para mostrarlo (no una colección vacía engañosa).
  const {
    data: lists,
    setData: setLists,
    isLoading,
    error: loadError,
    reload,
  } = useLoadedData(userId || null, getLists, NO_LISTS)

  const refresh = useCallback(async () => {
    setLists(await getLists())
  }, [setLists])

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
