import area from '@turf/area';
import centroid from '@turf/centroid';
import { polygon } from '@turf/helpers';

import type { FieldGeometryMetrics, GeoJsonPolygonFeature, LatLng } from './types';
import { isPolygonFeature } from './types';

export function computePolygonMetrics(feature: GeoJsonPolygonFeature): FieldGeometryMetrics {
  const areaM2 = area(feature);
  const center = centroid(feature);
  const [lng, lat] = center.geometry.coordinates;
  return {
    areaM2: Math.round(areaM2 * 100) / 100,
    areaHectares: Math.round((areaM2 / 10_000) * 10000) / 10000,
    centroid: { lat, lng },
  };
}

export function computeMetricsFromPolygonCoords(ring: LatLng[]): FieldGeometryMetrics | null {
  if (ring.length < 3) return null;
  const coords = ring.map((p) => [p.lng, p.lat] as [number, number]);
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    coords.push(first);
  }
  const feature = polygon([coords]);
  return computePolygonMetrics(feature as GeoJsonPolygonFeature);
}

export function parseBoundaryGeoJson(raw: unknown): GeoJsonPolygonFeature | null {
  if (!raw || typeof raw !== 'object') return null;
  if (isPolygonFeature(raw)) return raw;
  const obj = raw as { type?: string; geometry?: { type?: string } };
  if (obj.type === 'Polygon') {
    return {
      type: 'Feature',
      properties: {},
      geometry: raw as GeoJsonPolygonFeature['geometry'],
    };
  }
  if (obj.type === 'FeatureCollection') {
    const fc = raw as { features?: unknown[] };
    const poly = fc.features?.find((f) => isPolygonFeature(f));
    return poly ? (poly as GeoJsonPolygonFeature) : null;
  }
  return null;
}

/** Parse field centroid from metadata.centroid, PostGIS Point GeoJSON, or boundary ring. */
export function parseCentroidFromFieldGeo(
  metadata: unknown,
  centroidGeom?: unknown
): LatLng | null {
  const meta = (metadata ?? {}) as {
    centroid?: { lat?: number; lng?: number } | null;
    boundary_geojson?: unknown;
  };

  if (meta.centroid?.lat != null && meta.centroid?.lng != null) {
    return { lat: meta.centroid.lat, lng: meta.centroid.lng };
  }

  if (centroidGeom && typeof centroidGeom === 'object') {
    const g = centroidGeom as { type?: string; coordinates?: number[] };
    if (g.type === 'Point' && g.coordinates && g.coordinates.length >= 2) {
      return { lng: g.coordinates[0]!, lat: g.coordinates[1]! };
    }
  }

  const feature = parseBoundaryGeoJson(meta.boundary_geojson);
  if (!feature?.geometry?.coordinates?.[0]?.length) return null;

  const ring = feature.geometry.coordinates[0];
  let latSum = 0;
  let lngSum = 0;
  let n = 0;
  for (const coord of ring) {
    if (coord.length >= 2) {
      lngSum += coord[0]!;
      latSum += coord[1]!;
      n++;
    }
  }
  return n > 0 ? { lat: latSum / n, lng: lngSum / n } : null;
}

export { area, centroid };
