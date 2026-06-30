-- RLS tenant isolation tests (run with supabase test db)
-- Ref: docs/database-security-rules.md

begin;

-- Setup: use seed UUIDs
-- Org A: a1000000-0000-4000-8000-000000000001
-- Owner:  b1000000-0000-4000-8000-000000000001
-- Viewer: b1000000-0000-4000-8000-000000000003

-- Test 1: viewer cannot insert farms (expect permission denied)
set local role authenticated;
set local request.jwt.claim.sub = 'b1000000-0000-4000-8000-000000000003';

do $$
begin
  insert into public.farms (organization_id, name)
  values ('a1000000-0000-4000-8000-000000000001', 'RLS Test Farm');
  raise exception 'TEST FAILED: viewer should not insert farms';
exception
  when insufficient_privilege then
    raise notice 'PASS: viewer cannot insert farms';
end;
$$;

reset role;

commit;
