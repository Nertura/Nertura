import type { FieldIntelligenceContext, FarmIntelligenceProfile, SiteType } from '@nertura/ai';

import { parseCentroidFromFieldGeo } from '@nertura/geo';

import type { SupabaseClient } from '@supabase/supabase-js';



export interface FarmMemorySummary {

  farmId: string;

  farmName: string;

  location?: string | null;

  crops?: string[];

  siteType?: string | null;

}



function parseSiteType(value: unknown): SiteType {

  const v = String(value ?? 'field').toLowerCase();

  if (v === 'greenhouse' || v === 'orchard') return v;

  return 'field';

}



function buildLocationLabel(parts: {

  city?: string | null;

  district?: string | null;

  country?: string | null;

}): string | null {

  const line = [parts.district, parts.city, parts.country].filter(Boolean).join(', ');

  return line || null;

}



type FarmRow = {

  id: string;

  name: string;

  address: Record<string, unknown> | null;

  latitude: number | null;

  longitude: number | null;

  total_area: number | null;

  area_unit: string | null;

  metadata: Record<string, unknown> | null;

};



export async function loadFieldIntelligenceContext(

  supabase: SupabaseClient,

  organizationId: string,

  fieldId: string

): Promise<FieldIntelligenceContext | null> {

  const { data: field } = await supabase

    .from('fields')

    .select('id, name, farm_id, area, area_m2, soil_type, metadata, centroid, farms(name, address)')

    .eq('id', fieldId)

    .eq('organization_id', organizationId)

    .is('deleted_at', null)

    .maybeSingle();



  if (!field) return null;



  type FieldRow = {
    id: string;
    name: string;
    farm_id: string;
    area: number | null;
    area_m2: number | null;
    soil_type: string | null;
    metadata: Record<string, unknown> | null;
    centroid?: unknown;
    farms?: { name: string; address?: Record<string, unknown> } | { name: string; address?: Record<string, unknown> }[] | null;
  };

  const f = field as unknown as FieldRow;

  const farmRel = (Array.isArray(f.farms) ? f.farms[0] : f.farms) as
    | { name: string; address?: Record<string, unknown> }
    | null
    | undefined;

  const farmName = farmRel?.name ?? null;

  const farmAddress = (farmRel?.address ?? {}) as { city?: string; district?: string; country?: string };



  const { data: crops } = await supabase

    .from('crops')

    .select('crop_name')

    .eq('field_id', fieldId)

    .eq('organization_id', organizationId)

    .is('deleted_at', null)

    .in('status', ['active', 'planned']);



  const meta = f.metadata ?? {};



  return {

    fieldId: f.id,

    fieldName: f.name,

    farmId: f.farm_id,

    farmName,

    areaHectares: f.area != null ? Number(f.area) : null,

    areaM2: f.area_m2 != null ? Number(f.area_m2) : null,

    soilType: f.soil_type,

    fieldType: (meta as { field_type?: string }).field_type ?? null,

    centroid: parseCentroidFromFieldGeo(meta, f.centroid),

    hasBoundary: Boolean((meta as { boundary_geojson?: unknown }).boundary_geojson),

    cropsOnField: (crops ?? []).map((c) => c.crop_name as string),

    locationLabel: buildLocationLabel({

      city: farmAddress.city ?? null,

      district: farmAddress.district ?? null,

      country: farmAddress.country ?? null,

    }),

  };

}



export async function loadFarmIntelligenceProfile(

  supabase: SupabaseClient,

  organizationId: string,

  options?: { fieldId?: string | null }

): Promise<FarmIntelligenceProfile | null> {

  let selectedField: FieldIntelligenceContext | null = null;

  if (options?.fieldId) {

    selectedField = await loadFieldIntelligenceContext(

      supabase,

      organizationId,

      options.fieldId

    ).catch(() => null);

  }



  const farmQuery = selectedField?.farmId

    ? supabase

        .from('farms')

        .select('id, name, address, latitude, longitude, total_area, area_unit, metadata')

        .eq('id', selectedField.farmId)

        .eq('organization_id', organizationId)

        .is('deleted_at', null)

        .maybeSingle()

    : supabase

        .from('farms')

        .select('id, name, address, latitude, longitude, total_area, area_unit, metadata')

        .eq('organization_id', organizationId)

        .is('deleted_at', null)

        .order('created_at', { ascending: true })

        .limit(1)

        .maybeSingle();



  const [{ data: org }, { data: farm }, { data: crops }] = await Promise.all([

    supabase

      .from('organizations')

      .select('name, country_code, settings')

      .eq('id', organizationId)

      .maybeSingle(),

    farmQuery,

    supabase

      .from('crops')

      .select('crop_name')

      .eq('organization_id', organizationId)

      .is('deleted_at', null)

      .in('status', ['active', 'planned']),

  ]);



  if (!org && !farm) return null;



  const farmRow = farm as FarmRow | null;

  const settings = (org?.settings ?? {}) as {

    onboarding_profile?: {

      site_type?: string;

      crops?: string[];

      city?: string;

      district?: string;

    };

  };

  const onboarding = settings.onboarding_profile;

  const address = (farmRow?.address ?? {}) as { city?: string; district?: string; country?: string };

  const farmMeta = (farmRow?.metadata ?? {}) as { site_type?: string };



  const city = onboarding?.city ?? address.city ?? null;

  const district = onboarding?.district ?? address.district ?? null;

  const countryCode = org?.country_code ?? address.country ?? 'TR';

  const siteType = parseSiteType(onboarding?.site_type ?? farmMeta.site_type);

  const cropNames = [

    ...new Set([

      ...(onboarding?.crops ?? []),

      ...(crops ?? []).map((c) => c.crop_name as string),

    ]),

  ].filter(Boolean);



  const locationLabel =

    selectedField?.locationLabel ??

    buildLocationLabel({ city, district, country: countryCode });



  return {

    organizationName: org?.name ?? farmRow?.name ?? 'Farm',

    countryCode,

    city,

    district,

    latitude: farmRow?.latitude != null ? Number(farmRow.latitude) : null,

    longitude: farmRow?.longitude != null ? Number(farmRow.longitude) : null,

    farmSize: farmRow?.total_area != null ? Number(farmRow.total_area) : null,

    areaUnit: (farmRow?.area_unit as 'hectare' | 'acre') ?? 'hectare',

    siteType,

    crops: cropNames,

    locationLabel,

    selectedField,

  };

}



export { loadFarmIntelligenceProfile as loadFarmProfile };


