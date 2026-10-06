// Persistencia de los repositorios guardados.
// Hoy usa localStorage; cuando exista Supabase solo hay que reimplementar
// estas funciones (ya son asíncronas) sin tocar el resto de la aplicación.

const STORAGE_KEY = 'devcompass-saved-repos'

function readStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function writeStorage(repos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repos))
  } catch {
    throw new Error('No se pudo guardar en este navegador.')
  }
}

export async function getSavedRepos() {
  return readStorage()
}

export async function saveRepo(repo) {
  const repos = readStorage()
  if (repos.some((saved) => saved.id === repo.id)) return repos

  const updated = [{ ...repo, savedAt: new Date().toISOString() }, ...repos]
  writeStorage(updated)
  return updated
}

export async function removeRepo(repoId) {
  const updated = readStorage().filter((saved) => saved.id !== repoId)
  writeStorage(updated)
  return updated
}
