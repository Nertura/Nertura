import type { LatLng } from '../types';

export interface ReverseGeocodeResult {
  label: string;
  city?: string | null;
  district?: string | null;
  country?: string | null;
  countryCode?: string | null;
  postalCode?: string | null;
  raw?: Record<string, unknown>;
}

export interface ReverseGeocodingProvider {
  readonly id: string;
  isConfigured(): boolean;
  reverseGeocode(point: LatLng): Promise<ReverseGeocodeResult | null>;
}
