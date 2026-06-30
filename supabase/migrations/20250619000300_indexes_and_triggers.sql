-- Nertura Phase 2: indexes, constraints, and audit triggers

-- ---------------------------------------------------------------------------
-- Indexes — tenant isolation and query performance
-- ---------------------------------------------------------------------------

create index organizations_status_idx on public.organizations (status) where deleted_at is null;
create index organizations_region_idx on public.organizations (region_code) where deleted_at is null;

create index users_status_idx on public.users (status) where deleted_at is null;

create index memberships_organization_id_idx on public.memberships (organization_id) where deleted_at is null;
create index memberships_user_id_idx on public.memberships (user_id) where deleted_at is null;
create index memberships_farm_id_idx on public.memberships (farm_id) where deleted_at is null and farm_id is not null;

create index farms_organization_id_idx on public.farms (organization_id) where deleted_at is null;
create index farms_status_idx on public.farms (organization_id, status) where deleted_at is null;

create index fields_organization_id_idx on public.fields (organization_id) where deleted_at is null;
create index fields_farm_id_idx on public.fields (farm_id) where deleted_at is null;
create index fields_boundary_gist_idx on public.fields using gist (boundary) where deleted_at is null;

create index crops_organization_id_idx on public.crops (organization_id) where deleted_at is null;
create index crops_field_id_idx on public.crops (field_id) where deleted_at is null;
create index crops_field_season_idx on public.crops (field_id, season) where deleted_at is null;
create index crops_status_idx on public.crops (organization_id, status) where deleted_at is null;

create index subscriptions_organization_id_idx on public.subscriptions (organization_id);
create index subscriptions_status_idx on public.subscriptions (status);
create index subscriptions_external_id_idx on public.subscriptions (external_subscription_id) where external_subscription_id is not null;

create index ai_conversations_organization_id_idx on public.ai_conversations (organization_id) where deleted_at is null;
create index ai_conversations_user_id_idx on public.ai_conversations (user_id, created_at desc) where deleted_at is null;

create index audit_logs_organization_created_idx on public.audit_logs (organization_id, created_at desc);
create index audit_logs_user_created_idx on public.audit_logs (user_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_category_idx on public.audit_logs (category, created_at desc);

-- ---------------------------------------------------------------------------
-- Cross-table integrity: field.organization_id must match farm.organization_id
-- ---------------------------------------------------------------------------

create or replace function private.enforce_field_org_consistency()
returns trigger
language plpgsql
as $$
declare
  v_farm_org uuid;
begin
  select f.organization_id into v_farm_org
  from public.farms f
  where f.id = new.farm_id;

  if v_farm_org is null then
    raise exception 'Farm % not found', new.farm_id;
  end if;

  if new.organization_id is distinct from v_farm_org then
    raise exception 'Field organization_id must match farm organization_id';
  end if;

  return new;
end;
$$;

create or replace function private.enforce_crop_org_consistency()
returns trigger
language plpgsql
as $$
declare
  v_field_org uuid;
begin
  select fi.organization_id into v_field_org
  from public.fields fi
  where fi.id = new.field_id;

  if v_field_org is null then
    raise exception 'Field % not found', new.field_id;
  end if;

  if new.organization_id is distinct from v_field_org then
    raise exception 'Crop organization_id must match field organization_id';
  end if;

  return new;
end;
$$;

create or replace function private.enforce_membership_farm_org_consistency()
returns trigger
language plpgsql
as $$
declare
  v_farm_org uuid;
begin
  if new.farm_id is null then
    return new;
  end if;

  select f.organization_id into v_farm_org
  from public.farms f
  where f.id = new.farm_id;

  if v_farm_org is null then
    raise exception 'Farm % not found', new.farm_id;
  end if;

  if new.organization_id is distinct from v_farm_org then
    raise exception 'Membership farm must belong to the same organization';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Audit trigger (handles tables with and without organization_id)
-- ---------------------------------------------------------------------------

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_entity_id uuid;
  v_action text;
  v_changes jsonb;
begin
  v_action := lower(tg_op);

  if tg_table_name = 'organizations' then
    v_org_id := coalesce(new.id, old.id);
    v_entity_id := coalesce(new.id, old.id);
  elsif tg_table_name = 'users' then
    v_org_id := null;
    v_entity_id := coalesce(new.id, old.id);
  elsif tg_table_name = 'memberships' then
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_entity_id := coalesce(new.id, old.id);
  else
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_entity_id := coalesce(new.id, old.id);
  end if;

  if tg_op = 'DELETE' then
    v_changes := jsonb_build_object('before', to_jsonb(old));
  elsif tg_op = 'UPDATE' then
    v_changes := jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new));
  else
    v_changes := jsonb_build_object('after', to_jsonb(new));
  end if;

  perform private.write_audit_log(
    v_org_id,
    auth.uid(),
    case
      when private.is_platform_admin() then 'admin'::public.audit_actor_type
      when auth.uid() is not null then 'user'::public.audit_actor_type
      else 'system'::public.audit_actor_type
    end,
    'data_write'::public.audit_category,
    tg_table_name || '.' || v_action,
    tg_table_name,
    v_entity_id,
    'info'::public.audit_severity,
    v_changes
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function private.set_updated_at();

create trigger users_set_updated_at
  before update on public.users
  for each row execute function private.set_updated_at();

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function private.set_updated_at();

create trigger farms_set_updated_at
  before update on public.farms
  for each row execute function private.set_updated_at();

create trigger fields_set_updated_at
  before update on public.fields
  for each row execute function private.set_updated_at();

create trigger crops_set_updated_at
  before update on public.crops
  for each row execute function private.set_updated_at();

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function private.set_updated_at();

create trigger ai_conversations_set_updated_at
  before update on public.ai_conversations
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- created_by / updated_by triggers
-- ---------------------------------------------------------------------------

create trigger organizations_set_audit_columns
  before insert on public.organizations
  for each row execute function private.set_created_by();

create trigger organizations_set_updated_by
  before update on public.organizations
  for each row execute function private.set_updated_by();

create trigger users_set_audit_columns
  before insert on public.users
  for each row execute function private.set_created_by();

create trigger users_set_updated_by
  before update on public.users
  for each row execute function private.set_updated_by();

create trigger memberships_set_audit_columns
  before insert on public.memberships
  for each row execute function private.set_created_by();

create trigger memberships_set_updated_by
  before update on public.memberships
  for each row execute function private.set_updated_by();

create trigger farms_set_audit_columns
  before insert on public.farms
  for each row execute function private.set_created_by();

create trigger farms_set_updated_by
  before update on public.farms
  for each row execute function private.set_updated_by();

create trigger fields_set_audit_columns
  before insert on public.fields
  for each row execute function private.set_created_by();

create trigger fields_set_updated_by
  before update on public.fields
  for each row execute function private.set_updated_by();

create trigger crops_set_audit_columns
  before insert on public.crops
  for each row execute function private.set_created_by();

create trigger crops_set_updated_by
  before update on public.crops
  for each row execute function private.set_updated_by();

create trigger subscriptions_set_audit_columns
  before insert on public.subscriptions
  for each row execute function private.set_created_by();

create trigger subscriptions_set_updated_by
  before update on public.subscriptions
  for each row execute function private.set_updated_by();

create trigger ai_conversations_set_audit_columns
  before insert on public.ai_conversations
  for each row execute function private.set_created_by();

create trigger ai_conversations_set_updated_by
  before update on public.ai_conversations
  for each row execute function private.set_updated_by();

-- ---------------------------------------------------------------------------
-- Consistency triggers
-- ---------------------------------------------------------------------------

create trigger fields_enforce_org_consistency
  before insert or update on public.fields
  for each row execute function private.enforce_field_org_consistency();

create trigger crops_enforce_org_consistency
  before insert or update on public.crops
  for each row execute function private.enforce_crop_org_consistency();

create trigger memberships_enforce_farm_org_consistency
  before insert or update on public.memberships
  for each row execute function private.enforce_membership_farm_org_consistency();

-- ---------------------------------------------------------------------------
-- Audit triggers (sensitive mutable tables)
-- ---------------------------------------------------------------------------

create trigger organizations_audit
  after insert or update or delete on public.organizations
  for each row execute function private.audit_row_change();

create trigger memberships_audit
  after insert or update or delete on public.memberships
  for each row execute function private.audit_row_change();

create trigger farms_audit
  after insert or update or delete on public.farms
  for each row execute function private.audit_row_change();

create trigger fields_audit
  after insert or update or delete on public.fields
  for each row execute function private.audit_row_change();

create trigger crops_audit
  after insert or update or delete on public.crops
  for each row execute function private.audit_row_change();

create trigger subscriptions_audit
  after insert or update or delete on public.subscriptions
  for each row execute function private.audit_row_change();

-- ---------------------------------------------------------------------------
-- Prevent hard delete (soft delete only)
-- ---------------------------------------------------------------------------

create trigger organizations_prevent_hard_delete
  before delete on public.organizations
  for each row execute function private.prevent_hard_delete();

create trigger users_prevent_hard_delete
  before delete on public.users
  for each row execute function private.prevent_hard_delete();

create trigger memberships_prevent_hard_delete
  before delete on public.memberships
  for each row execute function private.prevent_hard_delete();

create trigger farms_prevent_hard_delete
  before delete on public.farms
  for each row execute function private.prevent_hard_delete();

create trigger fields_prevent_hard_delete
  before delete on public.fields
  for each row execute function private.prevent_hard_delete();

create trigger crops_prevent_hard_delete
  before delete on public.crops
  for each row execute function private.prevent_hard_delete();

create trigger subscriptions_prevent_hard_delete
  before delete on public.subscriptions
  for each row execute function private.prevent_hard_delete();

create trigger ai_conversations_prevent_hard_delete
  before delete on public.ai_conversations
  for each row execute function private.prevent_hard_delete();

create trigger audit_logs_prevent_mutation
  before update or delete on public.audit_logs
  for each row execute function private.prevent_hard_delete();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;
