import type { FeatureCollection } from 'geojson';

import type { LatLng } from '../types';

export interface MapInitOptions {
  center?: LatLng;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  interactive?: boolean;
  attributionControl?: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapInstance {
  readonly providerId: string;
  getCenter(): LatLng;
  getZoom(): number;
  setCenter(center: LatLng, zoom?: number): void;
  flyTo(center: LatLng, zoom?: number): void;
  zoomIn(): void;
  zoomOut(): void;
  fitBounds(bounds: MapBounds, padding?: number): void;
  addPolygon(id: string, coordinates: LatLng[], options?: { fillColor?: string; strokeColor?: string }): void;
  updatePolygon(id: string, coordinates: LatLng[]): void;
  /** Open line preview for in-progress drawing (2+ points, no auto-close). */
  updatePolyline(id: string, coordinates: LatLng[], options?: { strokeColor?: string }): void;
  /** Vertex markers for click-to-draw (numbered circles). */
  updatePoints(id: string, coordinates: LatLng[], options?: { color?: string }): void;
  removeLayer(id: string): void;
  setGeoJsonLayer(id: string, data: FeatureCollection): void;
  /** Disable double-click zoom and prepare for click-to-draw. */
  setDrawingEnabled(enabled: boolean): void;
  /** Map pitch in degrees (0 = top-down, 45–60 = tilt). */
  setPitch(pitch: number): void;
  onClick(handler: (point: LatLng) => void): () => void;
  resize(): void;
  destroy(): void;
}

export interface MapProvider {
  readonly id: string;
  readonly displayName: string;
  isConfigured(): boolean;
  createMap(container: HTMLElement, options?: MapInitOptions): Promise<MapInstance>;
}

export interface MapProviderConfig {
  accessToken?: string;
  styleUrl?: string;
}

export const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

declare const process: { env: Record<string, string | undefined> };

/** Use direct process.env so Next.js can inline NEXT_PUBLIC_* at build time. */
export function getMapboxAccessToken(): string | undefined {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
  return token || undefined;
}
