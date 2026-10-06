import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// El frontend llama a /api/github/... y este proxy (que corre en Node, no en el
// navegador) reenvía la petición a la API de GitHub añadiendo el token.
// Cuando exista backend en Supabase, este proxy se sustituirá por una Edge Function.
export default defineConfig(({ mode }) => {
  // El tercer parámetro '' carga todas las variables, no solo las VITE_*.
  // GITHUB_TOKEN no lleva prefijo VITE_, así que nunca se incluye en el bundle.
  const env = loadEnv(mode, process.cwd(), '')

  const githubProxy = {
    target: 'https://api.github.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/github/, ''),
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy: { '/api/github': githubProxy } },
    preview: { proxy: { '/api/github': githubProxy } },
  }
})
