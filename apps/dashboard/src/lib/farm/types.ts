/** Farm creation & display types (Sprint 1B). */

export type FarmSiteType =
  | 'farm'
  | 'greenhouse'
  | 'orchard'
  | 'cooperative'
  | 'other';

export type FarmAreaUnitInput = 'hectare' | 'donum' | 'acre';

export interface CreateFarmPayload {
  name: string;
  countryCode: string;
  city: string;
  district: string;
  siteType: FarmSiteType;
  totalArea?: number | null;
  areaUnit: FarmAreaUnitInput;
  latitude?: number | null;
  longitude?: number | null;
}

export const FARM_SITE_TYPE_OPTIONS: {
  id: FarmSiteType;
  label: string;
  labelTr: string;
}[] = [
  { id: 'farm', label: 'Farm', labelTr: 'Çiftlik / Tarla' },
  { id: 'greenhouse', label: 'Greenhouse', labelTr: 'Sera' },
  { id: 'orchard', label: 'Orchard', labelTr: 'Bahçe / Meyve' },
  { id: 'cooperative', label: 'Cooperative', labelTr: 'Kooperatif' },
  { id: 'other', label: 'Other', labelTr: 'Diğer' },
];

export const FARM_AREA_UNIT_OPTIONS: { id: FarmAreaUnitInput; label: string }[] = [
  { id: 'hectare', label: 'Hectare (ha)' },
  { id: 'donum', label: 'Dönüm' },
  { id: 'acre', label: 'Acre' },
];

export type FieldSiteType = 'field' | 'greenhouse' | 'orchard' | 'pasture' | 'other';

export const FIELD_TYPE_OPTIONS: { id: FieldSiteType; label: string }[] = [
  { id: 'field', label: 'Open field' },
  { id: 'greenhouse', label: 'Greenhouse block' },
  { id: 'orchard', label: 'Orchard block' },
  { id: 'pasture', label: 'Pasture' },
  { id: 'other', label: 'Other' },
];
