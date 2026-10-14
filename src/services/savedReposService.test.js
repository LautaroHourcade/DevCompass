import { beforeEach, describe, expect, it, vi } from 'vitest'

// Cliente de Supabase simulado: los tests nunca tocan la base de datos real.
const { supabase, queryResult } = vi.hoisted(() => {
  const queryResult = { data: [], error: null }

  // Cadena de consulta (from().select().eq()...): cada método devuelve la misma cadena
  // y al hacer await se resuelve con queryResult.
  function createQuery() {
    const query = {}
    for (const method of ['select', 'eq', 'order', 'update', 'delete', 'insert', 'single', 'maybeSingle']) {
      query[method] = vi.fn(() => query)
    }
    query.then = (resolve) => resolve({ data: queryResult.data, error: queryResult.error })
    return query
  }

  const supabase = {
    from: vi.fn(() => createQuery()),
    functions: { invoke: vi.fn() },
  }

  return { supabase, queryResult }
})

vi.mock('../lib/supabase', () => ({ supabase }))
vi.mock('./authService', () => ({ getCurrentUser: vi.fn(async () => ({ id: 'user-1' })) }))

const { getSavedRepos, saveRepo, toAppRepo, updateSavedRepoNote } = await import('./savedReposService')
const { getCurrentUser } = await import('./authService')

const savedRow = {
  id: 'saved-1',
  created_at: '2026-10-01T00:00:00Z',
  status: 'in_progress',
  notes: null,
  user_repository_tags: [{ tag_id: 'tag-1' }],
  repositories: {
    github_id: 42,
    name: 'repo',
    full_name: 'owner/repo',
    description: null,
    language: 'Go',
    stars: 10,
    forks: 2,
    open_issues: 1,
    updated_at: '2026-10-02T00:00:00Z',
    created_at: '2020-01-01T00:00:00Z',
    license: 'MIT',
    html_url: 'https://github.com/owner/repo',
    owner_login: 'owner',
    owner_avatar_url: 'https://avatars.example/owner',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  queryResult.data = []
  queryResult.error = null
})

describe('toAppRepo', () => {
  it('convierte la fila de Supabase al formato de la app con el seguimiento personal', () => {
    expect(toAppRepo(savedRow)).toMatchObject({
      id: 42,
      fullName: 'owner/repo',
      description: '',
      savedId: 'saved-1',
      status: 'in_progress',
      notes: '',
      tagIds: ['tag-1'],
      owner: { login: 'owner', url: 'https://github.com/owner' },
    })
  })
})

describe('getSavedRepos', () => {
  it('devuelve la colección convertida', async () => {
    queryResult.data = [savedRow]
    const repos = await getSavedRepos()
    expect(repos).toHaveLength(1)
    expect(repos[0].savedId).toBe('saved-1')
  })

  it('sin sesión devuelve una colección vacía sin consultar', async () => {
    getCurrentUser.mockResolvedValueOnce(null)
    expect(await getSavedRepos()).toEqual([])
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('traduce un error de Supabase a un mensaje para el usuario', async () => {
    queryResult.error = { message: 'boom' }
    await expect(getSavedRepos()).rejects.toThrow('No se pudieron cargar tus repositorios guardados.')
  })
})

describe('saveRepo', () => {
  it('solo envía el id de GitHub al servidor (nunca los datos del repositorio)', async () => {
    supabase.functions.invoke.mockResolvedValueOnce({ data: {}, error: null })
    await saveRepo({ id: 42, name: 'repo', url: 'https://malicioso.example' })

    expect(supabase.functions.invoke).toHaveBeenCalledWith('save-repository', {
      method: 'POST',
      body: { githubId: 42 },
    })
    // No escribe directamente en la tabla compartida repositories.
    expect(supabase.from).not.toHaveBeenCalledWith('repositories')
  })

  it('muestra el mensaje de error que devuelve el servidor', async () => {
    supabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: { context: { json: async () => ({ error: 'Este repositorio ya no está disponible en GitHub.' }) } },
    })
    await expect(saveRepo({ id: 42 })).rejects.toThrow('Este repositorio ya no está disponible en GitHub.')
  })

  it('usa un mensaje genérico si el error no trae mensaje', async () => {
    supabase.functions.invoke.mockResolvedValueOnce({ data: null, error: new Error('network') })
    await expect(saveRepo({ id: 42 })).rejects.toThrow('No se pudo guardar el repositorio. Inténtalo de nuevo.')
  })

  it('exige sesión iniciada', async () => {
    getCurrentUser.mockResolvedValueOnce(null)
    await expect(saveRepo({ id: 42 })).rejects.toThrow('Inicia sesión para guardar repositorios.')
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })
})

describe('updateSavedRepoNote', () => {
  it('recorta los espacios y una nota vacía se guarda como null (borrada)', async () => {
    queryResult.data = { id: 'saved-1' }

    expect(await updateSavedRepoNote('saved-1', '  leer el README  ')).toBe('leer el README')

    const query = supabase.from.mock.results.at(-1).value
    expect(query.update).toHaveBeenCalledWith({ notes: 'leer el README' })

    await updateSavedRepoNote('saved-1', '   ')
    const emptyQuery = supabase.from.mock.results.at(-1).value
    expect(emptyQuery.update).toHaveBeenCalledWith({ notes: null })
  })
})
