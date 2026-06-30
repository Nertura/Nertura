-- Sync auth.users → public.users (profile rows)
-- Fixes "User profile not found" during onboarding when auth row exists without public.users.

-- ---------------------------------------------------------------------------
-- Enhanced auth.users → public.users trigger (includes signup metadata)
-- ---------------------------------------------------------------------------

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.users (id, email, first_name, last_name, status)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'last_name', ''),
    'active'::public.user_status
  )
  on conflict (id) do update
    set email = excluded.email,
        first_name = coalesce(excluded.first_name, public.users.first_name),
        last_name = coalesce(excluded.last_name, public.users.last_name),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Idempotent profile sync helper (used by onboarding RPC + backfill)
-- ---------------------------------------------------------------------------

create or replace function private.sync_user_profile_from_auth(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if p_user_id is null then
    return;
  end if;

  insert into public.users (id, email, first_name, last_name, status)
  select
    au.id,
    coalesce(au.email, ''),
    nullif(au.raw_user_meta_data->>'first_name', ''),
    nullif(au.raw_user_meta_data->>'last_name', ''),
    'active'::public.user_status
  from auth.users au
  where au.id = p_user_id
  on conflict (id) do update
    set email = excluded.email,
        first_name = coalesce(excluded.first_name, public.users.first_name),
        last_name = coalesce(excluded.last_name, public.users.last_name),
        updated_at = timezone('utc', now());
end;
$$;

comment on function private.sync_user_profile_from_auth(uuid) is
  'Ensures public.users profile row exists for the given auth.users id.';

-- ---------------------------------------------------------------------------
-- Backfill: create missing profile rows for all existing auth users
-- ---------------------------------------------------------------------------

insert into public.users (id, email, first_name, last_name, status)
select
  au.id,
  coalesce(au.email, ''),
  nullif(au.raw_user_meta_data->>'first_name', ''),
  nullif(au.raw_user_meta_data->>'last_name', ''),
  'active'::public.user_status
from auth.users au
where not exists (
  select 1
  from public.users u
  where u.id = au.id
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Onboarding RPC: auto-sync profile before validation
-- ---------------------------------------------------------------------------

create or replace function public.create_organization_with_owner(
  p_name text,
  p_slug text,
  p_type public.organization_type,
  p_country_code char(2),
  p_timezone varchar(50) default 'Europe/Istanbul',
  p_default_currency char(3) default 'TRY',
  p_default_language char(5) default 'en-US'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_org_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated'
      using errcode = '28000';
  end if;

  perform private.sync_user_profile_from_auth(v_user_id);

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Organization name is required'
      using errcode = '22023';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid organization slug'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.users u
    where u.id = v_user_id
      and u.deleted_at is null
  ) then
    raise exception 'User profile not found'
      using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.memberships m
    where m.user_id = v_user_id
      and m.deleted_at is null
  ) then
    raise exception 'User already belongs to an organization'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.organizations o
    where o.slug = p_slug
      and o.deleted_at is null
  ) then
    raise exception 'Organization slug already taken'
      using errcode = '23505';
  end if;

  insert into public.organizations (
    name,
    slug,
    type,
    country_code,
    timezone,
    default_currency,
    default_language,
    status,
    created_by,
    updated_by
  )
  values (
    btrim(p_name),
    p_slug,
    p_type,
    p_country_code,
    p_timezone,
    p_default_currency,
    p_default_language,
    'trial'::public.organization_status,
    v_user_id,
    v_user_id
  )
  returning id into v_org_id;

  insert into public.memberships (
    user_id,
    organization_id,
    role,
    created_by,
    updated_by
  )
  values (
    v_user_id,
    v_org_id,
    'owner'::public.membership_role,
    v_user_id,
    v_user_id
  );

  update public.users
  set
    language = p_default_language,
    timezone = p_timezone,
    onboarding_completed_at = timezone('utc', now()),
    updated_at = timezone('utc', now()),
    updated_by = v_user_id
  where id = v_user_id;

  return v_org_id;
end;
$$;
