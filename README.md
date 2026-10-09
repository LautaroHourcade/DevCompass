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
  components/   auth, layout, search, repos, lists, tags, tracking, profile y ui
  views/        pantallas: Explorar, Guardados, Listas, Etiquetas, Perfil, Entrar y Registro
  hooks/        lógica de estado (sesión, búsqueda, guardados, listas, etiquetas, tema, toasts)
  services/     acceso a datos (API de GitHub y Supabase)
  context/      proveedores de sesión y notificaciones
  constants/    opciones de filtros, estados de seguimiento y colores de lenguajes
  utils/        formateo y validaciones
  styles/       Tailwind y tokens de diseño (1rem = 10px)
supabase/
  migrations/   esquema de la base de datos y políticas RLS
  functions/    Edge Functions (eliminar cuenta)
```

## Datos

Los usuarios, repositorios guardados, listas y etiquetas se guardan en Supabase. Cada tabla tiene
Row Level Security: un usuario solo puede leer y modificar sus propios datos, también accediendo
directamente a la base de datos.

En la colección de **Guardados** cada repositorio tiene un estado (Por aprender, En progreso,
Completado), una nota opcional y etiquetas propias. La colección se puede filtrar por estado y por
etiqueta. Las mismas etiquetas sirven para clasificar las **Listas**, que también se pueden filtrar
por etiqueta. Las etiquetas se gestionan en **Etiquetas**: no se permiten duplicados que solo difieran
en mayúsculas o espacios, y al eliminar una se quita de repositorios y listas sin borrarlos.
