-- Fix update_field_boundary: accept Polygon geometry or Feature; normalize before PostGIS parse.

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
  v_geojson jsonb;
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

  -- Normalize: PostGIS ST_GeomFromGeoJSON is reliable with Polygon geometry objects.
  if p_boundary_geojson->>'type' = 'Feature' then
    v_geojson := p_boundary_geojson->'geometry';
  elsif p_boundary_geojson->>'type' = 'Polygon' then
    v_geojson := p_boundary_geojson;
  else
    raise exception 'GeoJSON must be a Polygon or Feature with Polygon geometry';
  end if;

  if v_geojson is null or v_geojson->>'type' <> 'Polygon' then
    raise exception 'GeoJSON must be a Polygon';
  end if;

  v_geom := extensions.ST_SetSRID(
    extensions.ST_GeomFromGeoJSON(v_geojson::text),
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
      'boundary_geojson', jsonb_build_object(
        'type', 'Polygon',
        'coordinates', v_geojson->'coordinates'
      ),
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
  'Persists field polygon from GeoJSON Polygon (or Feature); computes area_m2, area (ha), centroid.';
