import { useCallback, useEffect, useMemo, useState } from 'react'
import { createTag, deleteTag, getTags, normalizeTagName, renameTag } from '../services/tagsService'

function sortByName(tags) {
  return [...tags].sort((first, second) => first.name.localeCompare(second.name, 'es', { sensitivity: 'base' }))
}

/** Etiquetas del usuario indicado. Sin usuario la lista está vacía. */
export function useTags(userId) {
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  // Si la carga falla guardamos el error para mostrarlo (no una colección vacía engañosa).
  const [loadError, setLoadError] = useState(null)
  // Cambiar reloadKey vuelve a lanzar la carga (botón "Reintentar").
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    setTags([])
    setLoadError(null)
    if (!userId) return

    setIsLoading(true)
    getTags()
      .then((loaded) => {
        if (isActive) setTags(sortByName(loaded))
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

  const getTagById = useCallback((tagId) => tags.find((tag) => tag.id === tagId), [tags])

  // Cada acción actualiza el estado local solo si Supabase confirma el cambio.
  const actions = useMemo(
    () => ({
      createTag: async (name) => {
        const created = await createTag(name)
        setTags((current) => sortByName([...current, created]))
        return created
      },
      renameTag: async (tagId, name) => {
        await renameTag(tagId, name)
        const newName = normalizeTagName(name)
        setTags((current) => sortByName(current.map((tag) => (tag.id === tagId ? { ...tag, name: newName } : tag))))
      },
      deleteTag: async (tagId) => {
        await deleteTag(tagId)
        setTags((current) => current.filter((tag) => tag.id !== tagId))
      },
    }),
    [],
  )

  return { tags, isLoading, loadError, reload, getTagById, ...actions }
}
