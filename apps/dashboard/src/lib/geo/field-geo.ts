import type { FieldGeoMetadata } from '@nertura/types';

import { parseBoundaryGeoJson } from '@nertura/geo';

import type { LatLng } from '@nertura/geo';



export interface FieldMapData {

  id: string;

  name: string;

  area: number | null;

  area_m2: number | null;

  soil_type: string | null;

  coordinates: LatLng[];

  fieldType?: string | null;

  cropName?: string | null;

}



export function fieldMetadataToCoordinates(metadata: Record<string, unknown>): LatLng[] {

  const meta = metadata as FieldGeoMetadata;

  const feature = parseBoundaryGeoJson(meta.boundary_geojson);

  if (!feature?.geometry?.coordinates?.[0]) return [];

  return feature.geometry.coordinates[0].map(([lng, lat]) => ({ lng, lat }));

}



export function fieldsToPolygonMap(

  fields: FieldMapData[]

): Record<string, { coordinates: LatLng[]; label?: string }> {

  const out: Record<string, { coordinates: LatLng[]; label?: string }> = {};

  for (const field of fields) {

    if (field.coordinates.length >= 3) {

      out[field.id] = { coordinates: field.coordinates, label: field.name };

    }

  }

  return out;

}



export function apiFieldToMapData(

  field: {

    id: string;

    name: string;

    area: number | null;

    area_m2?: number | null;

    soil_type: string | null;

    metadata?: Record<string, unknown> | null;

  },

  options?: {

    coordinates?: LatLng[];

    fieldType?: string | null;

    cropName?: string | null;

  }

): FieldMapData {

  const metadata = field.metadata ?? {};

  return {

    id: field.id,

    name: field.name,

    area: field.area,

    area_m2: field.area_m2 ?? null,

    soil_type: field.soil_type,

    coordinates: options?.coordinates ?? fieldMetadataToCoordinates(metadata),

    fieldType:

      options?.fieldType ?? (metadata as { field_type?: string }).field_type ?? null,

    cropName: options?.cropName ?? null,

  };

}



export function fieldRowToMapData(

  field: {

    id: string;

    name: string;

    area: number | null;

    area_m2?: number | null;

    soil_type: string | null;

    metadata?: Record<string, unknown> | null;

    fieldType?: string | null;

    crops?: { crop_name: string } | { crop_name: string }[] | null;

  }

): FieldMapData {

  const cropsRaw = field.crops;

  const cropList = Array.isArray(cropsRaw)

    ? cropsRaw.map((c) => c.crop_name)

    : cropsRaw?.crop_name

      ? [cropsRaw.crop_name]

      : [];



  return apiFieldToMapData(field, {

    fieldType: field.fieldType ?? (field.metadata as { field_type?: string })?.field_type ?? null,

    cropName: cropList[0] ?? null,

  });

}


