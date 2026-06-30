import type { OrganizationType } from '@nertura/types';
import type { SiteType } from '@nertura/ai';

export interface OnboardingWizardState {
  // Step 2 — Organization
  orgName: string;
  orgSlug: string;
  orgType: OrganizationType;
  // Step 3 — Location
  countryCode: string;
  city: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  // Step 4 — Site
  siteType: SiteType;
  farmSize: number | null;
  areaUnit: 'donum' | 'hectare' | 'acre';
  boundaryGeoJson: BoundaryPolygon | null;
  // Step 5 — Crops
  crops: string[];
}

/** GeoJSON polygon — map API ready */
export interface BoundaryPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

/** Step ids — labels from getOnboardingCopy().steps */
export const ONBOARDING_STEP_IDS = [
  'welcome',
  'organization',
  'location',
  'site',
  'crops',
  'confirm',
] as const;

export const ONBOARDING_STEPS = ONBOARDING_STEP_IDS.map((id) => ({ id, label: id }));

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export const INITIAL_ONBOARDING_STATE: OnboardingWizardState = {
  orgName: '',
  orgSlug: '',
  orgType: 'farm',
  countryCode: 'TR',
  city: '',
  district: '',
  latitude: 39.9334,
  longitude: 32.8597,
  siteType: 'field',
  farmSize: null,
  areaUnit: 'donum',
  boundaryGeoJson: null,
  crops: [],
};

export interface OnboardingCompletePayload {
  name: string;
  slug: string;
  type: OrganizationType;
  countryCode: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  farmSize: number;
  areaUnit: 'hectare' | 'acre';
  siteType: SiteType;
  crops: string[];
  boundaryGeoJson?: BoundaryPolygon | null;
}

export const COUNTRY_OPTIONS = [
  { code: 'TR', label: 'Turkey', timezone: 'Europe/Istanbul', currency: 'TRY', language: 'tr-TR' },
  { code: 'US', label: 'United States', timezone: 'America/Chicago', currency: 'USD', language: 'en-US' },
  { code: 'DE', label: 'Germany', timezone: 'Europe/Berlin', currency: 'EUR', language: 'de-DE' },
  { code: 'GB', label: 'United Kingdom', timezone: 'Europe/London', currency: 'GBP', language: 'en-GB' },
  { code: 'NL', label: 'Netherlands', timezone: 'Europe/Amsterdam', currency: 'EUR', language: 'nl-NL' },
  { code: 'ES', label: 'Spain', timezone: 'Europe/Madrid', currency: 'EUR', language: 'es-ES' },
] as const;

export const CROP_OPTIONS = [
  { id: 'tomato', label: 'Tomato', labelTr: 'Domates', emoji: '🍅' },
  { id: 'pepper', label: 'Pepper', labelTr: 'Biber', emoji: '🫑' },
  { id: 'wheat', label: 'Wheat', labelTr: 'Buğday', emoji: '🌾' },
  { id: 'corn', label: 'Corn', labelTr: 'Mısır', emoji: '🌽' },
  { id: 'olive', label: 'Olive', labelTr: 'Zeytin', emoji: '🫒' },
  { id: 'grape', label: 'Grape', labelTr: 'Üzüm', emoji: '🍇' },
  { id: 'citrus', label: 'Citrus', labelTr: 'Narenciye', emoji: '🍊' },
  { id: 'potato', label: 'Potato', labelTr: 'Patates', emoji: '🥔' },
  { id: 'cotton', label: 'Cotton', labelTr: 'Pamuk', emoji: '☁️' },
  { id: 'sunflower', label: 'Sunflower', labelTr: 'Ayçiçeği', emoji: '🌻' },
  { id: 'apple', label: 'Apple', labelTr: 'Elma', emoji: '🍎' },
  { id: 'cucumber', label: 'Cucumber', labelTr: 'Salatalık', emoji: '🥒' },
] as const;

export const SITE_TYPE_OPTIONS = [
  {
    id: 'field' as SiteType,
    label: 'Open Field',
    labelTr: 'Tarla',
    description: 'Row crops, grains, and broad-acre farming',
  },
  {
    id: 'greenhouse' as SiteType,
    label: 'Greenhouse',
    labelTr: 'Sera',
    description: 'Controlled environment, vegetables & seedlings',
  },
  {
    id: 'orchard' as SiteType,
    label: 'Orchard',
    labelTr: 'Bahçe / Meyve',
    description: 'Tree crops, vines, and permanent plantings',
  },
] as const;

