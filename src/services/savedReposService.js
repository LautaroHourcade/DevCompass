// Persistencia de los repositorios guardados en Supabase.
// Las funciones devuelven la lista completa actualizada, igual que antes con localStorage,
// para que useSavedRepos no tenga que cambiar.
import { supabase } from '../lib/supabase'
import { getCurrentUser } from './authService'
import { requestInitialCapture } from './statsService'

const UNIQUE_VIOLATION_CODE = '23505'

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

/** Convierte un repositorio de la app a la fila de la tabla repositories. */
function toRepositoryRow(repo) {
  return {
    github_id: repo.id,
    name: repo.name,
    full_name: repo.fullName,
    description: repo.description || null,
    html_url: repo.url,
    language: repo.language,
    stars: repo.stars,
    forks: repo.forks,
    open_issues: repo.openIssues,
    license: repo.license,
    owner_login: repo.owner.login,
    owner_avatar_url: repo.owner.avatarUrl,
    updated_at: repo.updatedAt,
    created_at: repo.createdAt,
    synced_at: new Date().toISOString(),
  }
}

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

export async function saveRepo(repo) {
  const userId = await getUserIdOrThrow()

  // Guardamos los datos del repositorio en la caché compartida (o los actualizamos).
  const { data: stored, error: upsertError } = await supabase
    .from('repositories')
    .upsert(toRepositoryRow(repo), { onConflict: 'github_id' })
    .select('id')
    .single()

  if (upsertError) throw new Error('No se pudo guardar el repositorio. Inténtalo de nuevo.')

  // La restricción UNIQUE (user_id, repository_id) impide duplicados.
  // Si ya estaba guardado, no es un error: simplemente devolvemos la lista.
  const { error: insertError } = await supabase
    .from('user_repositories')
    .insert({ user_id: userId, repository_id: stored.id })

  if (insertError && insertError.code !== UNIQUE_VIOLATION_CODE) {
    throw new Error('No se pudo guardar el repositorio. Inténtalo de nuevo.')
  }

  // Primera captura de estadísticas, a la vez que recargamos la colección.
  // Si falla no es grave: la tarea diaria la registrará en su próxima ejecución.
  const [repos] = await Promise.all([getSavedRepos(), requestInitialCapture(stored.id).catch(() => {})])
  return repos
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
