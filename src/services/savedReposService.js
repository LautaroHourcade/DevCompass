// Persistencia de los repositorios guardados en Supabase.
// Las funciones devuelven la lista completa actualizada para que useSavedRepos solo tenga que reemplazarla.
// La tabla compartida repositories solo la escribe el servidor (ver saveRepo).
import { supabase } from '../lib/supabase'
import { getCurrentUser } from './authService'

async function getUserIdOrThrow() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Inicia sesión para guardar repositorios.')
  return user.id
}

/**
 * Convierte una fila de user_repositories (con su repositorio) a la forma que usan los componentes.
 * savedId es el id de user_repositories: lo usan las listas.
 */
export function toAppRepo(row) {
  const repo = row.repositories

  return {
    id: repo.github_id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? '',
    language: repo.language,
    stars: repo.stars,
    forks: repo.forks,
    openIssues: repo.open_issues,
    updatedAt: repo.updated_at,
    createdAt: repo.created_at,
    license: repo.license,
    topics: [],
    homepage: '',
    url: repo.html_url,
    owner: {
      login: repo.owner_login,
      avatarUrl: repo.owner_avatar_url,
      url: `https://github.com/${repo.owner_login}`,
    },
    savedId: row.id,
    savedAt: row.created_at,
    // Seguimiento personal del usuario.
    status: row.status,
    notes: row.notes ?? '',
    tagIds: row.user_repository_tags.map((item) => item.tag_id),
  }
}

// Columnas que se piden siempre que se leen repositorios guardados.
export const SAVED_REPO_COLUMNS = 'id, created_at, status, notes, repositories(*), user_repository_tags(tag_id)'

export const MAX_NOTE_LENGTH = 2000

export async function getSavedRepos() {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_repositories')
    .select(SAVED_REPO_COLUMNS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error('No se pudieron cargar tus repositorios guardados.')

  return data.map(toAppRepo)
}

/**
 * Lee el mensaje de error que devuelve una Edge Function ({ error: "..." }).
 * Si no se puede leer, usa el mensaje genérico.
 */
async function getFunctionErrorMessage(error, fallback) {
  try {
    const body = await error.context?.json()
    return body?.error || fallback
  } catch {
    return fallback
  }
}

/**
 * Guarda un repositorio en la colección. Solo se envía su id de GitHub: el servidor
 * (Edge Function save-repository) pide los datos a GitHub, los guarda en la caché compartida,
 * lo añade a la colección del usuario y registra la primera captura de estadísticas.
 */
export async function saveRepo(repo) {
  await getUserIdOrThrow()

  const { error } = await supabase.functions.invoke('save-repository', {
    method: 'POST',
    body: { githubId: repo.id },
  })

  if (error) {
    throw new Error(await getFunctionErrorMessage(error, 'No se pudo guardar el repositorio. Inténtalo de nuevo.'))
  }

  return getSavedRepos()
}

export async function removeRepo(repoId) {
  const userId = await getUserIdOrThrow()

  const { data: stored, error: lookupError } = await supabase
    .from('repositories')
    .select('id')
    .eq('github_id', repoId)
    .maybeSingle()

  if (lookupError) throw new Error('No se pudo quitar el repositorio. Inténtalo de nuevo.')

  if (stored) {
    const { error: deleteError } = await supabase
      .from('user_repositories')
      .delete()
      .eq('user_id', userId)
      .eq('repository_id', stored.id)

    if (deleteError) throw new Error('No se pudo quitar el repositorio. Inténtalo de nuevo.')
  }

  return getSavedRepos()
}

/**
 * Actualiza el seguimiento de un repositorio guardado (solo status y notes son editables).
 * Si RLS no deja actualizar la fila, .single() falla y lo tratamos como error.
 */
async function updateSavedRepo(savedId, changes, errorMessage) {
  const { error } = await supabase
    .from('user_repositories')
    .update(changes)
    .eq('id', savedId)
    .select('id')
    .single()

  if (error) throw new Error(errorMessage)
}

export function updateSavedRepoStatus(savedId, status) {
  return updateSavedRepo(savedId, { status }, 'No se pudo cambiar el estado. Inténtalo de nuevo.')
}

/** Guarda la nota. Una nota vacía equivale a borrarla. Devuelve la nota guardada. */
export async function updateSavedRepoNote(savedId, notes) {
  const trimmedNotes = notes.trim()
  await updateSavedRepo(savedId, { notes: trimmedNotes || null }, 'No se pudo guardar la nota. Inténtalo de nuevo.')
  return trimmedNotes
}

export function deleteSavedRepoNote(savedId) {
  return updateSavedRepo(savedId, { notes: null }, 'No se pudo borrar la nota. Inténtalo de nuevo.')
}
