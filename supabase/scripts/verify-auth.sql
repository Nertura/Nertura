-- Auth configuration verification checklist (SQL probes)
-- Run against linked production or local Supabase DB

do $$
declare
  v_failures text[] := '{}';
  v_auth record;
begin
  -- Auth schema reachable
  if not exists (select 1 from information_schema.schemata where schema_name = 'auth') then
    v_failures := array_append(v_failures, 'auth schema missing');
  end if;

  -- public.users linked to auth.users
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'users'
      and constraint_type = 'FOREIGN KEY'
  ) then
    v_failures := array_append(v_failures, 'public.users FK to auth.users missing');
  end if;

  -- Auth sync trigger
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'auth' and c.relname = 'users' and t.tgname = 'on_auth_user_created'
  ) then
    v_failures := array_append(v_failures, 'on_auth_user_created trigger missing');
  end if;

  -- Onboarding function
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'create_organization_with_owner'
  ) then
    v_failures := array_append(v_failures, 'create_organization_with_owner function missing');
  end if;

  -- Auth event logger
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'log_auth_event'
  ) then
    v_failures := array_append(v_failures, 'log_auth_event function missing');
  end if;

  if array_length(v_failures, 1) > 0 then
    raise exception 'AUTH VERIFICATION FAILED:%', chr(10) || array_to_string(v_failures, chr(10));
  end if;

  raise notice 'AUTH VERIFICATION PASSED (database layer)';
  raise notice 'Manual dashboard checks required:';
  raise notice '  [ ] Email confirmations enabled';
  raise notice '  [ ] Magic link / OTP email enabled';
  raise notice '  [ ] MFA (TOTP) enabled';
  raise notice '  [ ] Password min length >= 12';
  raise notice '  [ ] Leaked password protection enabled';
  raise notice '  [ ] Redirect URLs configured for all apps';
  raise notice '  [ ] JWT expiry set (3600s recommended)';
end;
$$;
