# DevCompass

Aplicación web de seguimiento inteligente de repositorios de GitHub: busca, filtra, visualiza y guarda repositorios.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # opcional: añade tu GITHUB_TOKEN
npm run dev
```

Abre http://localhost:5173

## Token de GitHub

El navegador nunca habla directamente con `api.github.com`: llama a `/api/github/...` y un proxy
(el servidor de Vite en desarrollo) añade el token leído de `.env`. La variable **no** lleva el prefijo
`VITE_`, así que nunca se incluye en el código del frontend.

Sin token la app funciona igual, pero GitHub limita la búsqueda a 10 peticiones por minuto.

> Cuando exista el backend en Supabase, el proxy se sustituirá por una Edge Function cambiando solo
> `API_BASE_URL` en `src/services/githubService.js`.

## Estructura

```
src/
  components/   layout, search, repos y ui (componentes reutilizables)
  views/        pantallas: Explorar y Guardados
  hooks/        lógica de estado (búsqueda, guardados, tema, toasts)
  services/     acceso a datos (API de GitHub, guardados)
  context/      proveedor de notificaciones
  constants/    opciones de filtros y colores de lenguajes
  utils/        formateo de números y fechas
  styles/       Tailwind y tokens de diseño (1rem = 10px)
```

Los repositorios guardados se almacenan de momento en `localStorage` (`src/services/savedReposService.js`).
Para migrar a Supabase solo hay que reimplementar ese fichero.
