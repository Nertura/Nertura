-- Migration verification script
-- Run: psql $DATABASE_URL -f supabase/scripts/verify-migrations.sql
-- Or:  supabase db execute --file supabase/scripts/verify-migrations.sql

do $$
declare
  v_tables text[] := array[
    'organizations', 'users', 'memberships', 'farms', 'fields',
    'crops', 'subscriptions', 'ai_conversations', 'audit_logs'
  ];
  v_table text;
  v_count int;
  v_failures text[] := '{}';
  v_migrations int;
begin
  -- Expected migration count (update when adding migrations)
  select count(*) into v_migrations from supabase_migrations.schema_migrations;
  if v_migrations < 8 then
    v_failures := array_append(v_failures, format('Expected >= 8 migrations, found %s', v_migrations));
  end if;

  -- All core tables exist
  foreach v_table in array v_tables loop
    if not exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = v_table
    ) then
      v_failures := array_append(v_failures, format('Missing table: public.%s', v_table));
    end if;
  end loop;

  -- RLS enabled + forced on all tenant tables
  foreach v_table in array v_tables loop
    if not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = v_table
        and c.relrowsecurity = true
        and c.relforcerowsecurity = true
    ) then
      v_failures := array_append(v_failures, format('RLS not enabled/forced: public.%s', v_table));
    end if;
  end loop;

  -- Required extensions
  if not exists (select 1 from pg_extension where extname = 'postgis') then
    v_failures := array_append(v_failures, 'Missing extension: postgis');
  end if;

  if not exists (select 1 from pg_extension where extname = 'pgcrypto') then
    v_failures := array_append(v_failures, 'Missing extension: pgcrypto');
  end if;

  -- Security functions
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname = 'is_org_member'
  ) then
    v_failures := array_append(v_failures, 'Missing function: private.is_org_member');
  end if;

  -- Auth production functions
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'create_organization_with_owner'
  ) then
    v_failures := array_append(v_failures, 'Missing function: public.create_organization_with_owner');
  end if;

  -- Policy count (minimum expected)
  select count(*) into v_count
  from pg_policies
  where schemaname = 'public';

  if v_count < 30 then
    v_failures := array_append(v_failures, format('Expected >= 30 RLS policies, found %s', v_count));
  end if;

  -- Report
  if array_length(v_failures, 1) > 0 then
    raise exception 'VERIFICATION FAILED:%', chr(10) || array_to_string(v_failures, chr(10));
  end if;

  raise notice 'VERIFICATION PASSED: % tables, % policies, % migrations',
    array_length(v_tables, 1), v_count, v_migrations;
end;
$$;
