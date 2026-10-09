-- pg_net no se puede mover con ALTER EXTENSION: se reinstala en el esquema extensions.
-- Sus funciones (net.http_post) siguen en el esquema net, así que el cron no cambia.
drop extension if exists pg_net;
create extension pg_net with schema extensions;
