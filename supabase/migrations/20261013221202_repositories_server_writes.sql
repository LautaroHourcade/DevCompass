-- La tabla repositories es una caché compartida: si un usuario guarda un repositorio, todos los
-- que lo tengan guardado ven esos datos. Antes cualquier usuario con sesión podía insertar o
-- modificar cualquier fila (políticas "with check (true)"), es decir, cambiar el nombre, la
-- descripción o el enlace de un repositorio que otros también tienen guardado.
--
-- Ahora solo el servidor escribe aquí (Edge Functions save-repository y sync-repository-stats,
-- con service_role), siempre con datos pedidos directamente a GitHub. Los usuarios solo leen.

drop policy if exists "Usuarios autenticados insertan repositorios" on public.repositories;
drop policy if exists "Usuarios autenticados actualizan repositorios" on public.repositories;

revoke insert, update, delete on public.repositories from anon, authenticated;
