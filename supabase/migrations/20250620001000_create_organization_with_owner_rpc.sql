-- Onboarding RPC: create organization + owner membership for authenticated user
-- Called from apps/dashboard onboarding form via supabase.rpc('create_organization_with_owner', ...)

-- ---------------------------------------------------------------------------
-- users.onboarding_completed_at (referenced by dashboard session.ts)
-- ---------------------------------------------------------------------------

alter table public.users
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.users.onboarding_completed_at is
  'Set when the user completes organization onboarding.';

-- ---------------------------------------------------------------------------
-- public.create_organization_with_owner
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
set search_path = public
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

comment on function public.create_organization_with_owner(
  text,
  text,
  public.organization_type,
  char(2),
  varchar,
  char(3),
  char(5)
) is
  'Creates an organization and owner membership for auth.uid(); marks onboarding complete.';

revoke all on function public.create_organization_with_owner(
  text,
  text,
  public.organization_type,
  char(2),
  varchar,
  char(3),
  char(5)
) from public;

grant execute on function public.create_organization_with_owner(
  text,
  text,
  public.organization_type,
  char(2),
  varchar,
  char(3),
  char(5)
) to authenticated;
