/** Row types aligned with Supabase public schema (Phase 2). */

export type FarmStatus = 'active' | 'inactive' | 'archived';
export type FieldStatus = 'active' | 'fallow' | 'archived';
export type CropStatus = 'planned' | 'active' | 'harvested' | 'cancelled';
export type AreaUnit = 'hectare' | 'acre';

export interface Farm {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  address: Record<string, unknown>;
  latitude: number | null;
  longitude: number | null;
  total_area: number | null;
  area_unit: AreaUnit;
  timezone: string | null;
  status: FarmStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Field {
  id: string;
  farm_id: string;
  organization_id: string;
  name: string;
  /** Area in hectares (legacy column) */
  area: number | null;
  /** Area in square metres (geo intelligence) */
  area_m2?: number | null;
  soil_type: string | null;
  soil_ph: number | null;
  elevation: number | null;
  slope: number | null;
  status: FieldStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  farms?: { name: string } | { name: string }[] | null;
}

/** GeoJSON boundary stored in fields.metadata.boundary_geojson or via RPC */
export interface FieldGeoMetadata {
  boundary_geojson?: GeoJsonPolygonLike | null;
  geo_updated_at?: string | null;
  centroid?: { lat: number; lng: number } | null;
}

export interface GeoJsonPolygonLike {
  type: 'Feature' | 'Polygon';
  geometry?: { type: 'Polygon'; coordinates: number[][][] };
  coordinates?: number[][][];
  properties?: Record<string, unknown>;
}

export interface Crop {
  id: string;
  organization_id: string;
  field_id: string;
  crop_name: string;
  variety_name: string | null;
  season: string;
  planting_date: string | null;
  expected_harvest_date: string | null;
  actual_harvest_date: string | null;
  target_yield: number | null;
  yield_unit: string | null;
  current_stage: string | null;
  status: CropStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  fields?: { name: string; farm_id: string } | { name: string; farm_id: string }[] | null;
}

export interface AiConversation {
  id: string;
  organization_id: string;
  user_id: string;
  title: string | null;
  metadata: {
    messages?: AiMessage[];
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}
