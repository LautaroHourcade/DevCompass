# DevCompass

Aplicación web de seguimiento inteligente de repositorios de GitHub: busca, filtra, visualiza y guarda repositorios.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # añade la URL y la clave publishable de Supabase
npm run dev
```

Abre http://localhost:5173

## Token de GitHub

El navegador nunca habla directamente con `api.github.com`: llama a la Edge Function
`github-proxy` de Supabase (`supabase/functions/github-proxy`), que añade el token. La función solo
reenvía las rutas que usa la app (búsqueda y lenguajes), así que no sirve como proxy abierto.

Para configurar el token:
1. Crea un token en https://github.com/settings/tokens (no necesita permisos).
2. En Supabase: **Edge Functions → Secrets** → añade `GITHUB_TOKEN` con ese valor.

Sin token la app funciona igual, pero GitHub limita la búsqueda a 10 peticiones por minuto.

## Estructura

```
src/
  components/   auth, layout, search, repos, lists, tags, tracking, stats, profile y ui
  views/        pantallas: Explorar, Guardados, Listas, Etiquetas, Perfil, Entrar y Registro
  hooks/        lógica de estado (sesión, búsqueda, guardados, listas, etiquetas, tema, toasts)
  services/     acceso a datos (API de GitHub y Supabase)
  context/      proveedores de sesión y notificaciones
  constants/    opciones de filtros, estados de seguimiento y colores de lenguajes
  utils/        formateo y validaciones
  styles/       Tailwind y tokens de diseño (1rem = 10px)
supabase/
  migrations/   esquema de la base de datos y políticas RLS
  functions/    Edge Functions (proxy de GitHub, estadísticas diarias, eliminar cuenta)
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

## Estadísticas diarias

DevCompass guarda un historial de stars, forks e issues abiertos de cada repositorio guardado
(tabla `repository_stats`) y lo muestra en el detalle con dos gráficos de líneas.

- **Captura inicial:** al guardar un repositorio, la app pide su primera captura a la Edge Function
  `sync-repository-stats`, que solo la acepta si el usuario tiene ese repositorio guardado.
- **Tarea diaria:** Supabase Cron (`sync-repository-stats-daily`, 03:00 UTC) llama a la misma
  función. Procesa cada repositorio una sola vez, aunque lo hayan guardado muchos usuarios.
- **Una captura al día:** la restricción única `(repository_id, captured_on)` lo garantiza aunque la
  tarea se ejecute dos veces.
- **Errores:** si GitHub no responde, se alcanza el límite o el repositorio ya no existe, el problema
  se registra en `repository_sync_log` y el historial no se toca.

El cron lee dos valores de Supabase Vault: `project_url` y `sync_stats_cron_secret` (un secreto
aleatorio generado dentro de la base de datos que la función comprueba con `is_valid_cron_secret`).
En un proyecto nuevo hay que crearlos una vez:

```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'sync_stats_cron_secret');
```

