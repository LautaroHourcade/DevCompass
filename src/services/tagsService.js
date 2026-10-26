// Etiquetas propias del usuario (user_tags) y su asignación a repositorios guardados
// (user_repository_tags). Las políticas RLS impiden tocar etiquetas de otros usuarios.
import { supabase } from '../lib/supabase'
import { getCurrentUser } from './authService'
import { TranslatableError } from '../i18n/TranslatableError'

const UNIQUE_VIOLATION_CODE = '23505'
export const MAX_TAG_NAME_LENGTH = 30

/** Quita espacios al principio y al final y deja un solo espacio entre palabras. */
export function normalizeTagName(name) {
  return name.trim().replace(/\s+/g, ' ')
}

function toAppTag(row) {
  return { id: row.id, name: row.name }
}

function toTagError(error, fallbackKey) {
  if (error.code === UNIQUE_VIOLATION_CODE) return new TranslatableError('errors.tags.duplicate')
  return new TranslatableError(fallbackKey)
}

export async function getTags() {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_tags')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name')

  if (error) throw new TranslatableError('errors.tags.load')

  return data.map(toAppTag)
}

/** Crea la etiqueta y la devuelve (la necesitamos para asignarla al momento). */
export async function createTag(name) {
  const user = await getCurrentUser()
  if (!user) throw new TranslatableError('errors.tags.signIn')

  const { data, error } = await supabase
    .from('user_tags')
    .insert({ user_id: user.id, name: normalizeTagName(name) })
    .select('id, name')
    .single()

  if (error) throw toTagError(error, 'errors.tags.create')

  return toAppTag(data)
}

export async function renameTag(tagId, name) {
  const { error } = await supabase
    .from('user_tags')
    .update({ name: normalizeTagName(name) })
    .eq('id', tagId)
    .select('id')
    .single()

  if (error) throw toTagError(error, 'errors.tags.rename')
}

/** Al borrar la etiqueta, la base de datos borra sus asignaciones (no los repositorios). */
export async function deleteTag(tagId) {
  const { error } = await supabase.from('user_tags').delete().eq('id', tagId)

  if (error) throw new TranslatableError('errors.tags.delete')
}

export async function addTagToSavedRepo(savedId, tagId) {
  const { error } = await supabase
    .from('user_repository_tags')
    .insert({ user_repository_id: savedId, tag_id: tagId })

  // Si ya tenía la etiqueta no es un error.
  if (error && error.code !== UNIQUE_VIOLATION_CODE) {
    throw new TranslatableError('errors.tags.add')
  }
}

export async function removeTagFromSavedRepo(savedId, tagId) {
  const { error } = await supabase
    .from('user_repository_tags')
    .delete()
    .eq('user_repository_id', savedId)
    .eq('tag_id', tagId)

  if (error) throw new TranslatableError('errors.tags.remove')
}
