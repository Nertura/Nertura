-- RLS policy verification script
-- Run after seed: supabase db reset && supabase db execute --file supabase/scripts/verify-rls.sql

begin;

-- ---------------------------------------------------------------------------
-- Test fixtures (seed UUIDs)
-- ---------------------------------------------------------------------------
-- Org:    a1000000-0000-4000-8000-000000000001
-- Owner:  b1000000-0000-4000-8000-000000000001
-- Viewer: b1000000-0000-4000-8000-000000000003

create temp table rls_results (
  test_name text primary key,
  passed boolean not null,
  detail text
);

-- Helper to run as authenticated user
create or replace function pg_temp.run_as_user(p_user_id uuid)
returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Test 1: Viewer can SELECT farms in their org
-- ---------------------------------------------------------------------------
do $$
declare v_count int;
begin
  perform pg_temp.run_as_user('b1000000-0000-4000-8000-000000000003');
  select count(*) into v_count from public.farms where deleted_at is null;
  insert into rls_results values (
    'viewer_select_farms',
    v_count >= 1,
    format('count=%s', v_count)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Test 2: Viewer cannot INSERT farms
-- ---------------------------------------------------------------------------
do $$
begin
  perform pg_temp.run_as_user('b1000000-0000-4000-8000-000000000003');
  begin
    insert into public.farms (organization_id, name)
    values ('a1000000-0000-4000-8000-000000000001', 'RLS Violation Farm');
    insert into rls_results values ('viewer_insert_farms', false, 'insert succeeded unexpectedly');
  exception when insufficient_privilege then
    insert into rls_results values ('viewer_insert_farms', true, 'permission denied as expected');
  end;
end;
$$;

-- ---------------------------------------------------------------------------
-- Test 3: Owner can INSERT farms
-- ---------------------------------------------------------------------------
do $$
declare v_id uuid;
begin
  perform pg_temp.run_as_user('b1000000-0000-4000-8000-000000000001');
  insert into public.farms (organization_id, name)
  values ('a1000000-0000-4000-8000-000000000001', 'RLS Test Farm')
  returning id into v_id;
  insert into rls_results values ('owner_insert_farms', v_id is not null, format('id=%s', v_id));
  update public.farms
  set deleted_at = timezone('utc', now())
  where id = v_id;
exception when others then
  insert into rls_results values ('owner_insert_farms', false, sqlerrm);
end;
$$;

-- Soft-delete cleanup for test farm if inserted
do $$
begin
  perform pg_temp.run_as_user('b1000000-0000-4000-8000-000000000001');
  update public.farms
  set deleted_at = timezone('utc', now())
  where name = 'RLS Test Farm' and deleted_at is null;
exception when others then null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Test 4: Viewer cannot read audit_logs
-- ---------------------------------------------------------------------------
do $$
declare v_count int;
begin
  perform pg_temp.run_as_user('b1000000-0000-4000-8000-000000000003');
  select count(*) into v_count from public.audit_logs;
  insert into rls_results values (
    'viewer_select_audit_logs',
    v_count = 0,
    format('count=%s (expected 0)', v_count)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Test 5: Owner can read subscriptions
-- ---------------------------------------------------------------------------
do $$
declare v_count int;
begin
  perform pg_temp.run_as_user('b1000000-0000-4000-8000-000000000001');
  select count(*) into v_count from public.subscriptions where deleted_at is null;
  insert into rls_results values (
    'owner_select_subscriptions',
    v_count >= 1,
    format('count=%s', v_count)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Test 6: Viewer cannot read subscriptions
-- ---------------------------------------------------------------------------
do $$
declare v_count int;
begin
  perform pg_temp.run_as_user('b1000000-0000-4000-8000-000000000003');
  select count(*) into v_count from public.subscriptions;
  insert into rls_results values (
    'viewer_select_subscriptions',
    v_count = 0,
    format('count=%s (expected 0)', v_count)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Report
-- ---------------------------------------------------------------------------
do $$
declare
  v_failures int;
begin
  select count(*) into v_failures from rls_results where not passed;

  if v_failures > 0 then
    raise exception 'RLS VERIFICATION FAILED: % failing tests', v_failures;
  end if;

  raise notice 'RLS VERIFICATION PASSED: % tests', (select count(*) from rls_results);
end;
$$;

select * from rls_results order by test_name;

rollback;
