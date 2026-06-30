-- Nertura Phase 2: enums and timestamp helpers

create type public.organization_type as enum (
  'farm',
  'cooperative',
  'ag_company',
  'supplier',
  'exporter'
);

create type public.organization_status as enum (
  'active',
  'suspended',
  'trial',
  'cancelled'
);

create type public.user_status as enum (
  'active',
  'invited',
  'deactivated'
);

create type public.membership_role as enum (
  'owner',
  'admin',
  'manager',
  'operator',
  'viewer',
  'member',
  'partner'
);

create type public.farm_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.area_unit as enum (
  'hectare',
  'acre'
);

create type public.field_status as enum (
  'active',
  'fallow',
  'archived'
);

create type public.crop_status as enum (
  'planned',
  'active',
  'harvested',
  'cancelled'
);

create type public.subscription_plan as enum (
  'starter',
  'professional',
  'business',
  'enterprise'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'paused'
);

create type public.billing_cycle as enum (
  'monthly',
  'annual'
);

create type public.audit_actor_type as enum (
  'user',
  'admin',
  'system',
  'webhook'
);

create type public.audit_category as enum (
  'auth',
  'authorization',
  'data_read',
  'data_write',
  'ai',
  'consent',
  'billing',
  'approval',
  'admin',
  'security',
  'privacy'
);

create type public.audit_severity as enum (
  'info',
  'warning',
  'critical'
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function private.set_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    new.created_by = auth.uid();
  end if;
  if new.updated_by is null then
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

create or replace function private.set_updated_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_by = auth.uid();
  return new;
end;
$$;

create or replace function private.prevent_hard_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Hard delete is not permitted on %. Use soft delete (deleted_at).', tg_table_name;
end;
$$;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin',
    false
  );
$$;
