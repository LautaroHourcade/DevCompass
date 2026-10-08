-- Si se borrara un repositorio de la caché compartida, el CASCADE anterior eliminaba
-- también los guardados de TODOS los usuarios. Con RESTRICT la base de datos se niega
-- a borrar un repositorio mientras alguien lo tenga guardado.
-- Solo se sustituye la regla de la relación (no se borran datos), en una única
-- instrucción atómica: o se aplica entera o no se aplica nada.
alter table public.user_repositories
  drop constraint user_repositories_repository_id_fkey,
  add constraint user_repositories_repository_id_fkey
    foreign key (repository_id) references public.repositories (id) on delete restrict;
