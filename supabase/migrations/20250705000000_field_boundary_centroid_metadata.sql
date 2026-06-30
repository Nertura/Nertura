-- Persist lat/lng centroid in metadata for client + AI context (matches PostGIS ST_Centroid)

create or replace function public.update_field_boundary(
  p_field_id uuid,
  p_boundary_geojson jsonb,
  p_close_ring boolean default true
)
returns public.fields
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_field public.fields;
  v_geom extensions.geometry;
  v_area_m2 numeric;
  v_centroid extensions.geometry;
  v_centroid_lat numeric;
  v_centroid_lng numeric;
begin
  if p_boundary_geojson is null then
    raise exception 'boundary_geojson is required';
  end if;

  select * into v_field
  from public.fields
  where id = p_field_id
    and deleted_at is null;

  if not found then
    raise exception 'Field not found';
  end if;

  v_geom := extensions.ST_SetSRID(
    extensions.ST_GeomFromGeoJSON(p_boundary_geojson::text),
    4326
  );

  if extensions.ST_GeometryType(v_geom) not in ('ST_Polygon', 'ST_MultiPolygon') then
    raise exception 'GeoJSON must be a Polygon';
  end if;

  if not extensions.ST_IsValid(v_geom) then
    v_geom := extensions.ST_MakeValid(v_geom);
  end if;

  v_area_m2 := extensions.ST_Area(v_geom::extensions.geography);
  v_centroid := extensions.ST_Centroid(v_geom);
  v_centroid_lng := extensions.ST_X(v_centroid);
  v_centroid_lat := extensions.ST_Y(v_centroid);

  update public.fields
  set
    boundary = extensions.ST_Force2D(v_geom)::extensions.geometry(Polygon, 4326),
    area_m2 = round(v_area_m2::numeric, 2),
    area = round((v_area_m2 / 10000.0)::numeric, 4),
    centroid = v_centroid,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'boundary_geojson', p_boundary_geojson,
      'geo_updated_at', timezone('utc', now()),
      'centroid', jsonb_build_object('lat', v_centroid_lat, 'lng', v_centroid_lng)
    ),
    updated_at = timezone('utc', now())
  where id = p_field_id
  returning * into v_field;

  return v_field;
end;
$$;

comment on function public.update_field_boundary(uuid, jsonb, boolean) is
  'Persists field polygon from GeoJSON; computes area_m2, area (ha), centroid column + metadata.centroid.';
