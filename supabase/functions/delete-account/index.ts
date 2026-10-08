// Borra la cuenta del usuario que hace la petición.
// Corre en Supabase (Deno). La clave service_role solo existe aquí, en el servidor.
// Al borrar el usuario de auth.users, sus guardados y listas se borran en cascada.
import { createClient } from 'npm:@supabase/supabase-js@2'

// El navegador hace una petición OPTIONS previa (CORS) antes del POST.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido.' }, 405)
  }

  // Cliente con privilegios de administrador. Solo existe aquí, nunca en el navegador.
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // El token de sesión del usuario nos dice quién hace la petición.
  // Solo se borra la cuenta de ese usuario, nunca un id que venga del cliente.
  const token = (request.headers.get('Authorization') ?? '').replace('Bearer ', '')

  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token)

  if (!token || userError || !user) {
    return jsonResponse({ error: 'Sesión no válida.' }, 401)
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return jsonResponse({ error: 'No se pudo eliminar la cuenta.' }, 500)
  }

  return jsonResponse({ deleted: true }, 200)
})
