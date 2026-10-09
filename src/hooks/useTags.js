import { useCallback, useEffect, useMemo, useState } from 'react'
import { createTag, deleteTag, getTags, normalizeTagName, renameTag } from '../services/tagsService'

function sortByName(tags) {
  return [...tags].sort((first, second) => first.name.localeCompare(second.name, 'es', { sensitivity: 'base' }))
}

/** Etiquetas del usuario indicado. Sin usuario la lista está vacía. */
export function useTags(userId) {
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isActive = true

    setTags([])
    if (!userId) return

    setIsLoading(true)
    getTags()
      .then((loaded) => {
        if (isActive) setTags(sortByName(loaded))
      })
      .catch(() => {
        if (isActive) setTags([])
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [userId])

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

  return { tags, isLoading, getTagById, ...actions }
}
