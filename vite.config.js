/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Las peticiones a GitHub pasan por la Edge Function github-proxy de Supabase
// (ver src/services/githubService.js), así que no hace falta proxy en Vite.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tests (Vitest): navegador simulado con jsdom. Ver src/test/setup.js.
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // Variables de entorno falsas: los tests nunca hablan con el Supabase real.
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Las librerías van en ficheros propios: cambian poco y el navegador las mantiene en caché.
        codeSplitting: {
          groups: [
            // [\\/]: separador de rutas en Linux/macOS (/) y en Windows (\).
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/ },
          ],
        },
      },
    },
  },
})
