import type { Feature, FeatureCollection, Polygon, Position } from 'geojson';

export type { Feature, FeatureCollection, Polygon, Position };

export interface LatLng {
  lat: number;
  lng: number;
}

export interface FieldGeometryMetrics {
  areaM2: number;
  areaHectares: number;
  centroid: LatLng;
}

export interface GeoJsonPolygonFeature extends Feature<Polygon> {
  geometry: Polygon;
}

export function isPolygonFeature(value: unknown): value is GeoJsonPolygonFeature {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Feature;
  return obj.type === 'Feature' && obj.geometry?.type === 'Polygon';
}

export function positionsToPolygonFeature(positions: LatLng[]): GeoJsonPolygonFeature | null {
  if (positions.length < 3) return null;
  const cleaned: LatLng[] = [];
  for (const p of positions) {
    const lng = Number(p.lng);
    const lat = Number(p.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    const last = cleaned[cleaned.length - 1];
    if (last && last.lng === lng && last.lat === lat) continue;
    cleaned.push({ lat, lng });
  }
  if (cleaned.length < 3) return null;
  const ring: Position[] = cleaned.map((p) => [p.lng, p.lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    ring.push([first[0], first[1]]);
  }
  if (ring.length < 4) return null;
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [ring],
    },
  };
}
