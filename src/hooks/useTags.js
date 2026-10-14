import { useCallback, useMemo } from 'react'
import { createTag, deleteTag, getTags, normalizeTagName, renameTag } from '../services/tagsService'
import { useLoadedData } from './useLoadedData'

function sortByName(tags) {
  return [...tags].sort((first, second) => first.name.localeCompare(second.name, 'es', { sensitivity: 'base' }))
}

const NO_TAGS = []

// Las etiquetas se muestran siempre ordenadas por nombre.
const loadSortedTags = async () => sortByName(await getTags())

/** Etiquetas del usuario indicado. Sin usuario la lista está vacía. */
export function useTags(userId) {
  // Si la carga falla, loadError guarda el error para mostrarlo (no una colección vacía engañosa).
  const {
    data: tags,
    setData: setTags,
    isLoading,
    error: loadError,
    reload,
  } = useLoadedData(userId || null, loadSortedTags, NO_TAGS)

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
    [setTags],
  )

  return { tags, isLoading, loadError, reload, getTagById, ...actions }
}
