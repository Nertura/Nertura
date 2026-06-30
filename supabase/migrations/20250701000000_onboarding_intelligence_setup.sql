-- Full agriculture intelligence onboarding: org + farm + field + crops in one transaction

create or replace function public.complete_onboarding_setup(
  p_name text,
  p_slug text,
  p_type public.organization_type,
  p_country_code char(2),
  p_city text,
  p_district text,
  p_latitude numeric,
  p_longitude numeric,
  p_farm_size numeric,
  p_area_unit public.area_unit default 'hectare',
  p_site_type text default 'field',
  p_crops text[] default '{}',
  p_boundary_geojson jsonb default null,
  p_timezone varchar(50) default 'Europe/Istanbul',
  p_default_currency char(3) default 'TRY',
  p_default_language char(5) default 'tr-TR'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_org_id uuid;
  v_farm_id uuid;
  v_field_id uuid;
  v_crop text;
  v_site_label text;
  v_season text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Organization name is required' using errcode = '22023';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid organization slug' using errcode = '22023';
  end if;

  if p_crops is null or array_length(p_crops, 1) is null or array_length(p_crops, 1) = 0 then
    raise exception 'At least one crop is required' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.memberships m
    where m.user_id = v_user_id and m.deleted_at is null
  ) then
    raise exception 'User already belongs to an organization' using errcode = '23505';
  end if;

  if exists (
    select 1 from public.organizations o
    where o.slug = p_slug and o.deleted_at is null
  ) then
    raise exception 'Organization slug already taken' using errcode = '23505';
  end if;

  v_season := to_char(timezone('utc', now()), 'YYYY');

  v_site_label := case lower(coalesce(p_site_type, 'field'))
    when 'greenhouse' then 'Greenhouse'
    when 'orchard' then 'Orchard'
    else 'Field'
  end;

  insert into public.organizations (
    name,
    slug,
    type,
    country_code,
    timezone,
    default_currency,
    default_language,
    status,
    settings,
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
    jsonb_build_object(
      'onboarding_profile', jsonb_build_object(
        'site_type', lower(coalesce(p_site_type, 'field')),
        'crops', to_jsonb(p_crops),
        'city', nullif(btrim(p_city), ''),
        'district', nullif(btrim(p_district), ''),
        'coordinates', jsonb_build_object(
          'latitude', p_latitude,
          'longitude', p_longitude
        ),
        'farm_size', p_farm_size,
        'area_unit', p_area_unit::text,
        'boundary_geojson', p_boundary_geojson,
        'intelligence', jsonb_build_object(
          'climate', jsonb_build_object('status', 'placeholder', 'source', 'future_weather_api'),
          'soil', jsonb_build_object('status', 'placeholder', 'source', 'future_soil_api'),
          'regional_disease_risk', jsonb_build_object('status', 'placeholder', 'source', 'future_risk_model'),
          'crop_calendar', jsonb_build_object('status', 'placeholder', 'source', 'future_crop_calendar'),
          'satellite_ndvi', jsonb_build_object('status', 'future_ready', 'source', 'future_satellite_api')
        ),
        'completed_at', timezone('utc', now())
      )
    ),
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

  insert into public.farms (
    organization_id,
    name,
    description,
    address,
    latitude,
    longitude,
    total_area,
    area_unit,
    timezone,
    status,
    metadata,
    created_by,
    updated_by
  )
  values (
    v_org_id,
    btrim(p_name),
    'Primary operation created during onboarding',
    jsonb_strip_nulls(jsonb_build_object(
      'country', p_country_code,
      'city', nullif(btrim(p_city), ''),
      'district', nullif(btrim(p_district), '')
    )),
    p_latitude,
    p_longitude,
    p_farm_size,
    coalesce(p_area_unit, 'hectare'::public.area_unit),
    p_timezone,
    'active'::public.farm_status,
    jsonb_build_object(
      'site_type', lower(coalesce(p_site_type, 'field')),
      'onboarding', true
    ),
    v_user_id,
    v_user_id
  )
  returning id into v_farm_id;

  insert into public.fields (
    organization_id,
    farm_id,
    name,
    area,
    status,
    metadata,
    created_by,
    updated_by
  )
  values (
    v_org_id,
    v_farm_id,
    v_site_label || ' — Main',
    p_farm_size,
    'active'::public.field_status,
    jsonb_strip_nulls(jsonb_build_object(
      'site_type', lower(coalesce(p_site_type, 'field')),
      'boundary_geojson', p_boundary_geojson,
      'onboarding', true
    )),
    v_user_id,
    v_user_id
  )
  returning id into v_field_id;

  foreach v_crop in array p_crops loop
    insert into public.crops (
      organization_id,
      field_id,
      crop_name,
      season,
      status,
      metadata,
      created_by,
      updated_by
    )
    values (
      v_org_id,
      v_field_id,
      btrim(v_crop),
      v_season,
      'active'::public.crop_status,
      jsonb_build_object('onboarding', true, 'crop_id', btrim(v_crop)),
      v_user_id,
      v_user_id
    );
  end loop;

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

comment on function public.complete_onboarding_setup is
  'Creates organization, farm, field, and crops for agriculture intelligence onboarding.';

revoke all on function public.complete_onboarding_setup(
  text, text, public.organization_type, char(2), text, text,
  numeric, numeric, numeric, public.area_unit, text, text[], jsonb,
  varchar, char(3), char(5)
) from public;

grant execute on function public.complete_onboarding_setup(
  text, text, public.organization_type, char(2), text, text,
  numeric, numeric, numeric, public.area_unit, text, text[], jsonb,
  varchar, char(3), char(5)
) to authenticated;
