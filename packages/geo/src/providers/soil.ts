import type { LatLng } from '../types';

export interface SoilSample {
  soilType?: string | null;
  ph?: number | null;
  organicMatterPct?: number | null;
  texture?: string | null;
  fetchedAt: string;
  provider: string;
  stub?: boolean;
}

export interface SoilProvider {
  readonly id: string;
  isConfigured(): boolean;
  getSoilAtPoint(point: LatLng): Promise<SoilSample | null>;
}
