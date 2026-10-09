// Proxy de solo lectura hacia la API de GitHub.
// Corre en Supabase (Deno): el token GITHUB_TOKEN es un secreto de Supabase y nunca llega al navegador.
// Solo reenvía las rutas que usa la aplicación, para que no sirva como proxy abierto.

const GITHUB_API_URL = 'https://api.github.com'

// El navegador hace una petición OPTIONS previa (CORS) antes del GET.
// Expose-Headers deja que el frontend lea las cabeceras del límite de GitHub.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Expose-Headers': 'x-ratelimit-remaining, x-ratelimit-reset',
}

// Rutas permitidas y cuánto tiempo puede cachearse su respuesta (en segundos).
const ALLOWED_ROUTES = [
  { pattern: /^\/search\/repositories$/, maxAge: 60 },
  { pattern: /^\/repositories\/\d+\/languages$/, maxAge: 86400 },
]

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

  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Método no permitido.' }, 405)
  }

  // La URL llega como /github-proxy/search/repositories?q=...: nos quedamos con lo que va detrás.
  const url = new URL(request.url)
  const githubPath = url.pathname.replace(/^.*?\/github-proxy/, '')
  const route = ALLOWED_ROUTES.find(({ pattern }) => pattern.test(githubPath))

  if (!route) {
    return jsonResponse({ error: 'Ruta no permitida.' }, 404)
  }

  const githubHeaders: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'DevCompass',
  }

  // Sin token también funciona, pero con el límite bajo de GitHub.
  const token = Deno.env.get('GITHUB_TOKEN')
  if (token) githubHeaders.Authorization = `Bearer ${token}`

  let githubResponse: Response
  try {
    githubResponse = await fetch(`${GITHUB_API_URL}${githubPath}${url.search}`, { headers: githubHeaders })
  } catch {
    return jsonResponse({ error: 'No se pudo conectar con GitHub.' }, 502)
  }

  const headers: Record<string, string> = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    // Solo se cachean las respuestas correctas.
    'Cache-Control': githubResponse.ok ? `public, max-age=${route.maxAge}` : 'no-store',
  }

  for (const name of ['x-ratelimit-remaining', 'x-ratelimit-reset']) {
    const value = githubResponse.headers.get(name)
    if (value) headers[name] = value
  }

  return new Response(githubResponse.body, { status: githubResponse.status, headers })
})
