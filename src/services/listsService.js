// Listas personales de repositorios guardados (tablas lists y list_repositories).
// Cada lista guarda los ids de user_repositories que contiene (savedIds): así el detalle
// de una lista se obtiene filtrando los repos guardados, sin otra consulta.
// Las etiquetas (tagIds) solo clasifican la lista: no cambian qué repositorios contiene.
import { supabase } from '../lib/supabase'
import { getCurrentUser } from './authService'
import { TranslatableError } from '../i18n/TranslatableError'

const UNIQUE_VIOLATION_CODE = '23505'
export const MAX_LIST_NAME_LENGTH = 60
export const MAX_LIST_DESCRIPTION_LENGTH = 280

function toAppList(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    savedIds: row.list_repositories.map((item) => item.user_repository_id),
    tagIds: row.list_tags.map((item) => item.tag_id),
  }
}

function toListError(error, fallbackKey) {
  if (error.code === UNIQUE_VIOLATION_CODE) return new TranslatableError('errors.lists.duplicate')
  return new TranslatableError(fallbackKey)
}

export async function getLists() {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('lists')
    .select('id, name, description, created_at, updated_at, list_repositories(user_repository_id), list_tags(tag_id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new TranslatableError('errors.lists.load')

  return data.map(toAppList)
}

export async function createList({ name, description }) {
  const user = await getCurrentUser()
  if (!user) throw new TranslatableError('errors.lists.signIn')

  const { error } = await supabase.from('lists').insert({
    user_id: user.id,
    name: name.trim(),
    description: description.trim() || null,
  })

  if (error) throw toListError(error, 'errors.lists.create')
}

export async function updateList(listId, { name, description }) {
  const { error } = await supabase
    .from('lists')
    .update({ name: name.trim(), description: description.trim() || null })
    .eq('id', listId)

  if (error) throw toListError(error, 'errors.lists.update')
}

export async function deleteList(listId) {
  const { error } = await supabase.from('lists').delete().eq('id', listId)

  if (error) throw new TranslatableError('errors.lists.delete')
}

export async function addRepoToList(listId, savedId) {
  const { error } = await supabase
    .from('list_repositories')
    .insert({ list_id: listId, user_repository_id: savedId })

  // Si ya estaba en la lista no es un error.
  if (error && error.code !== UNIQUE_VIOLATION_CODE) {
    throw new TranslatableError('errors.lists.addRepo')
  }
}

export async function removeRepoFromList(listId, savedId) {
  const { error } = await supabase
    .from('list_repositories')
    .delete()
    .eq('list_id', listId)
    .eq('user_repository_id', savedId)

  if (error) throw new TranslatableError('errors.lists.removeRepo')
}

export async function addTagToList(listId, tagId) {
  const { error } = await supabase.from('list_tags').insert({ list_id: listId, tag_id: tagId })

  // Si ya tenía la etiqueta no es un error.
  if (error && error.code !== UNIQUE_VIOLATION_CODE) {
    throw new TranslatableError('errors.lists.addTag')
  }
}

export async function removeTagFromList(listId, tagId) {
  const { error } = await supabase.from('list_tags').delete().eq('list_id', listId).eq('tag_id', tagId)

  if (error) throw new TranslatableError('errors.lists.removeTag')
}
