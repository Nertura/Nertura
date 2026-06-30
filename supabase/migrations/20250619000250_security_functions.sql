-- Nertura Phase 2: security functions (requires core schema)

create or replace function private.is_org_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = p_organization_id
      and m.user_id = auth.uid()
      and m.deleted_at is null
  );
$$;

create or replace function private.get_membership_role(p_organization_id uuid)
returns public.membership_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.memberships m
  where m.organization_id = p_organization_id
    and m.user_id = auth.uid()
    and m.deleted_at is null
  limit 1;
$$;

create or replace function private.has_org_role(
  p_organization_id uuid,
  p_roles public.membership_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = p_organization_id
      and m.user_id = auth.uid()
      and m.deleted_at is null
      and m.role = any (p_roles)
  );
$$;

create or replace function private.can_write_org(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.has_org_role(
    p_organization_id,
    array['owner', 'admin', 'manager', 'operator']::public.membership_role[]
  );
$$;

create or replace function private.can_admin_org(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.has_org_role(
    p_organization_id,
    array['owner', 'admin']::public.membership_role[]
  );
$$;

create or replace function private.is_org_owner(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.has_org_role(
    p_organization_id,
    array['owner']::public.membership_role[]
  );
$$;

create or replace function private.write_audit_log(
  p_organization_id uuid,
  p_user_id uuid,
  p_actor_type public.audit_actor_type,
  p_category public.audit_category,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_severity public.audit_severity default 'info',
  p_changes jsonb default null,
  p_ip_address inet default null,
  p_user_agent text default null,
  p_request_id text default null,
  p_impersonation boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_email text;
begin
  select u.email into v_email
  from public.users u
  where u.id = p_user_id;

  insert into public.audit_logs (
    organization_id,
    user_id,
    actor_type,
    actor_email,
    category,
    action,
    entity_type,
    entity_id,
    severity,
    changes,
    ip_address,
    user_agent,
    request_id,
    impersonation
  )
  values (
    p_organization_id,
    p_user_id,
    p_actor_type,
    v_email,
    p_category,
    p_action,
    p_entity_type,
    p_entity_id,
    p_severity,
    p_changes,
    p_ip_address,
    p_user_agent,
    p_request_id,
    p_impersonation
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, status)
  values (
    new.id,
    new.email,
    'active'::public.user_status
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_auth_user();

grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_role(uuid, public.membership_role[]) to authenticated;
grant execute on function private.can_write_org(uuid) to authenticated;
grant execute on function private.can_admin_org(uuid) to authenticated;
grant execute on function private.is_org_owner(uuid) to authenticated;
grant execute on function private.is_platform_admin() to authenticated;
