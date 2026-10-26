# DevCompass

Aplicación web de seguimiento inteligente de repositorios de GitHub: busca, filtra, visualiza y guarda repositorios.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # añade la URL y la clave publishable de Supabase
npm run dev
```

Abre http://localhost:5173

## Despliegue (Vercel)

1. En Vercel, **Add New → Project** e importa el repositorio. `vercel.json` ya indica el framework
   (Vite), el comando de build y la carpeta `dist`.
2. En **Settings → Environment Variables** añade `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_PUBLISHABLE_KEY` (los mismos valores que en `.env`) y vuelve a desplegar.
3. En Supabase, **Authentication → URL Configuration**:
   - *Site URL*: la URL de producción, por ejemplo `https://devcompass.vercel.app`.
   - *Redirect URLs*: añade `https://devcompass.vercel.app/**` (y `http://localhost:5173/**` para
     seguir desarrollando en local). Sin esto, los enlaces de los emails de confirmación apuntan a `localhost`.
4. En Supabase, **Authentication → Sign In / Providers → Email**: longitud mínima `8` y
   *Password requirements* `Letters and digits`, igual que la validación del cliente
   (`src/utils/validation.js`).

`vercel.json` también redirige todas las rutas a `index.html` (la app usa `BrowserRouter`; sin esto,
recargar `/panel` daría 404), cachea `assets/` de forma permanente (los nombres llevan hash) y añade
cabeceras de seguridad básicas.

Las Edge Functions y el cron siguen en Supabase: Vercel solo sirve el frontend estático.

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
  components/   auth, layout, search, repos, lists, tags, tracking, stats, dashboard, compare, profile y ui
  views/        pantallas: Explorar, Panel, Guardados, Listas, Etiquetas, Comparar, Perfil, Entrar y Registro
  hooks/        lógica de estado (sesión, búsqueda, guardados, listas, etiquetas, tema, toasts)
  services/     acceso a datos (API de GitHub y Supabase)
  context/      proveedores de sesión y notificaciones
  constants/    opciones de filtros, estados de seguimiento y colores de lenguajes
  utils/        formateo, validaciones y cálculos de la colección
  styles/       Tailwind y tokens de diseño (1rem = 10px)
supabase/
  migrations/   esquema de la base de datos y políticas RLS
  functions/    Edge Functions (proxy de GitHub, guardar repositorio, estadísticas diarias, eliminar cuenta)
  tests/        comprobación de aislamiento entre usuarios (RLS)
```

## Datos

**Guardar un repositorio:** el navegador solo envía su id de GitHub a la Edge Function
`save-repository`. Es el servidor quien pide los datos (nombre, descripción, enlace...) directamente a
GitHub y los guarda en la tabla compartida `repositories`. Los usuarios solo pueden leer esa tabla: así
nadie puede falsificar los datos de un repositorio que otros también tienen guardado.


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

- **Captura inicial:** al guardar un repositorio, la Edge Function `save-repository` registra su
  primera captura con los mismos datos que acaba de pedir a GitHub.
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


## Panel

La pestaña **Panel** (`/panel`) resume la colección: total de guardados y cuántos hay por aprender, en
progreso o completados; distribución por lenguaje; estadísticas agregadas (stars y forks totales, media de
stars, el más popular, repos con notas y etiquetas en uso); los últimos repositorios guardados y los que
tuvieron actividad más reciente en GitHub. Desde ahí se abre el detalle de cualquier repositorio o se va a
la colección completa y a la comparación. Todo se calcula en el navegador a partir de la colección ya cargada.

## Comparar

En **Comparar** (`/comparar`) se eligen de dos a tres repositorios guardados. Una tabla muestra sus
estadísticas actuales (resaltando el valor más alto) y un gráfico compara la evolución de sus stars con las
capturas de `repository_stats`. Los repositorios con menos de dos capturas se indican aparte, sin impedir la
comparación de sus estadísticas actuales. La selección se guarda en la URL (`?repos=id1,id2`) y quitar un
repositorio de la comparación no lo borra de la colección.

## Diseño

Identidad "instrumento de navegación": papel cálido (claro) y tinta azul-negra (oscuro) con un único
acento lima, tipografías Geist y Geist Mono (alojadas con `@fontsource-variable`, sin CDN) y cifras en
mono tabular. Los tokens de color, las curvas de movimiento (`--ease-out`, `--ease-in-out`,
`--ease-drawer`) y las utilidades propias (`ruler`, `dot-grid`, `kbd`) están en `src/styles/index.css`.

- La aguja de la marca apunta al rumbo de cada sección (`src/constants/navigation.js`) y gira por el camino más corto.
- Pestañas con indicador recortado por `clip-path`, menú de usuario y menú móvil en `<dialog>`.
- El cambio de tema se abre en círculo desde el botón (View Transitions); sin soporte es instantáneo.
- Animaciones cortas (≤300 ms) con `transform`/`opacity`; con `prefers-reduced-motion` desaparecen
  desplazamientos y giros y se mantienen los fundidos.
- Atajo: `/` enfoca el buscador de Explorar.

## Idiomas

La interfaz está en **español e inglés**; el botón `ES` / `EN` de la cabecera (y del menú móvil) cambia
de idioma al momento y la elección se recuerda en el navegador. La primera vez se usa el idioma del
navegador (español si empieza por `es`, inglés en cualquier otro caso). Solo se traduce el texto de la
interfaz: los datos de GitHub (descripciones, temas) se muestran tal cual.

- Los textos viven en `src/i18n/translations/es.js` y `en.js`, agrupados por pantalla.
- En un componente: `const { t } = useTranslation()` y `t('saved.title')`. Variables con `{nombre}`
  (`t('profile.greeting', { name })`) y plurales con `clave_one` / `clave_other` (`t('saved.count', { count })`).
- Fuera de React (services): `translate(clave)` o `throw new TranslatableError(clave)`, que traduce el
  mensaje cada vez que se lee.
- Fechas y números (`src/utils/formatters.js`) usan el formato del idioma activo.
- `src/i18n/translations.test.js` comprueba que ambos idiomas tienen las mismas claves y variables.

Los emails de Supabase Auth (confirmación de cuenta, código de cambio de contraseña) usan las plantillas
del panel de Supabase (**Authentication → Email Templates**) y no cambian con el idioma de la interfaz.

## Calidad

```bash
npm run lint     # ESLint (incluye las reglas del proyecto: sin var, alert ni innerHTML)
npm test         # Vitest + Testing Library (lógica, servicios con Supabase simulado y componentes)
npm run build    # build de producción
```

Los tests nunca hablan con el Supabase real: usan un cliente simulado y variables de entorno falsas
(`vite.config.js` → `test`).

**Aislamiento entre usuarios (RLS):** `supabase/tests/rls.sql` simula a un usuario ajeno e intenta leer
y modificar los datos de otro (guardados, notas, estados, etiquetas, listas, historial y la caché de
repositorios). Ejecútalo entero en el SQL Editor de Supabase: devuelve `RLS OK` y no deja datos, porque
todo ocurre en una transacción que se deshace al final.

## Limitaciones conocidas

- **Proxy de GitHub público:** `github-proxy` acepta peticiones sin sesión para que se pueda explorar sin
  cuenta. Solo reenvía las rutas de búsqueda y lenguajes, pero cualquiera puede consumir el cupo del
  token de GitHub del proyecto (5.000 peticiones/hora). Si fuera un problema, habría que exigir sesión o
  añadir un límite por IP.
- **Protección de contraseñas filtradas:** Supabase solo la ofrece en los planes de pago
  (*Leaked password protection*), así que en el plan gratuito queda desactivada. Como alternativa, la app
  y Supabase exigen al menos 8 caracteres con letras y números (`src/utils/validation.js`); al pasar a
  un plan de pago conviene activarla.
- **Tests de extremo a extremo:** los flujos completos (entrar, buscar, guardar...) se revisan a mano en el
  navegador; no hay tests automáticos con un navegador real (p. ej. Playwright).
- **Edge Functions:** el código Deno de `supabase/functions` no pasa por ESLint ni por Vitest.
