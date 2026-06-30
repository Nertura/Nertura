import type { GeoJsonPolygonFeature } from '../types';

export interface SatelliteScene {
  sceneId: string;
  capturedAt: string;
  cloudCoverPct?: number | null;
  provider: string;
  stub?: boolean;
  previewUrl?: string | null;
}

export interface SatelliteProvider {
  readonly id: string;
  isConfigured(): boolean;
  getLatestScene(boundary: GeoJsonPolygonFeature): Promise<SatelliteScene | null>;
  getNdviIndex?(boundary: GeoJsonPolygonFeature): Promise<number | null>;
}
