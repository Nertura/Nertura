-- Nertura Phase 2: extensions and schemas
-- Ref: docs/database-blueprint.md, docs/database-security-rules.md

create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "postgis" with schema extensions;

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

grant usage on schema public to postgres, anon, authenticated, service_role;
