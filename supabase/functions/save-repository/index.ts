// Guarda un repositorio en la colección del usuario que hace la petición.
// Corre en Supabase (Deno) con service_role.
//
// Por seguridad, el navegador solo envía el id de GitHub: los datos del repositorio (nombre,
// descripción, enlace...) se piden aquí directamente a GitHub. Así nadie puede escribir datos
// falsos en la tabla compartida repositories, que ven todos los usuarios que lo guardan.
//
// POST { githubId } con la sesión del usuario (Authorization: Bearer <token>).
import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  captureStats,
  corsHeaders,
  fetchGitHubRepository,
  jsonResponse,
  toRepositoryRow,
} from '../_shared/github.ts'

const UNIQUE_VIOLATION_CODE = '23505'

// Mensajes para el usuario según el problema con GitHub.
const PROBLEM_MESSAGES = {
  not_found: 'Este repositorio ya no está disponible en GitHub.',
  rate_limited: 'GitHub ha limitado las peticiones. Inténtalo de nuevo en unos minutos.',
  github_error: 'GitHub no responde ahora mismo. Inténtalo de nuevo.',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido.' }, 405)
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // El usuario sale del token de sesión, nunca de un id que envíe el cliente.
  const token = (request.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const {
    data: { user },
  } = await admin.auth.getUser(token)

  if (!token || !user) return jsonResponse({ error: 'Inicia sesión para guardar repositorios.' }, 401)

  const body = await request.json().catch(() => ({}))
  const githubId = Number(body.githubId)
  if (!Number.isSafeInteger(githubId) || githubId <= 0) {
    return jsonResponse({ error: 'Repositorio no válido.' }, 400)
  }

  // 1. Datos del repositorio, directamente de GitHub.
  const github = await fetchGitHubRepository(githubId)
  if (!github.ok) {
    const status = github.problem === 'not_found' ? 404 : github.problem === 'rate_limited' ? 429 : 502
    return jsonResponse({ error: PROBLEM_MESSAGES[github.problem] }, status)
  }

  // 2. Caché compartida: se crea o se actualiza con los datos de GitHub.
  const { data: stored, error: upsertError } = await admin
    .from('repositories')
    .upsert(toRepositoryRow(github.data), { onConflict: 'github_id' })
    .select('id')
    .single()

  if (upsertError) return jsonResponse({ error: 'No se pudo guardar el repositorio. Inténtalo de nuevo.' }, 500)

  // 3. Colección del usuario. La restricción UNIQUE (user_id, repository_id) impide duplicados;
  //    si ya lo tenía guardado no es un error.
  const { error: insertError } = await admin
    .from('user_repositories')
    .insert({ user_id: user.id, repository_id: stored.id })

  if (insertError && insertError.code !== UNIQUE_VIOLATION_CODE) {
    return jsonResponse({ error: 'No se pudo guardar el repositorio. Inténtalo de nuevo.' }, 500)
  }

  // 4. Primera captura de estadísticas con los mismos datos (sin pedirlos otra vez a GitHub).
  //    Si falla no es grave: la tarea diaria la registrará en su próxima ejecución.
  const capture = await captureStats(admin, stored.id, github.data)

  return jsonResponse({ repositoryId: stored.id, capture }, 200)
})
