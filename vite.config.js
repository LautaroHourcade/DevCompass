import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Las peticiones a GitHub pasan por la Edge Function github-proxy de Supabase
// (ver src/services/githubService.js), así que no hace falta proxy en Vite.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Las librerías van en ficheros propios: cambian poco y el navegador las mantiene en caché.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/ },
            { name: 'supabase', test: /node_modules[\/]@supabase[\/]/ },
          ],
        },
      },
    },
  },
})
