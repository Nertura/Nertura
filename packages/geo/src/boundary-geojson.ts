import type { LatLng, Position } from './types';

/** GeoJSON Polygon geometry — format required by PostGIS ST_GeomFromGeoJSON. */
export interface BoundaryPolygonGeoJson {
  type: 'Polygon';
  coordinates: Position[][];
}

const FRIENDLY_INVALID = 'invalid polygon ring';

export function buildClosedPolygonRing(positions: LatLng[]): Position[] | null {
  if (positions.length < 3) return null;

  const cleaned: LatLng[] = [];
  for (const p of positions) {
    const lng = Number(p.lng);
    const lat = Number(p.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) continue;
    const last = cleaned[cleaned.length - 1];
    if (last && last.lng === lng && last.lat === lat) continue;
    cleaned.push({ lat, lng });
  }

  if (cleaned.length < 3) return null;

  const ring: Position[] = cleaned.map((p) => [p.lng, p.lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (!first || !last) return null;
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }

  return ring.length >= 4 ? ring : null;
}

/** Build a closed Polygon geometry for PostGIS (not a Feature wrapper). */
export function positionsToBoundaryGeoJson(positions: LatLng[]): BoundaryPolygonGeoJson | null {
  const ring = buildClosedPolygonRing(positions);
  if (!ring) return null;
  return {
    type: 'Polygon',
    coordinates: [ring],
  };
}

function isPositionPair(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

/** Normalize Feature or Polygon input to Polygon geometry. */
export function normalizeToBoundaryPolygonGeoJson(
  input: unknown
): BoundaryPolygonGeoJson | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;

  let geometry: Record<string, unknown> | null = null;
  if (obj.type === 'Feature' && obj.geometry && typeof obj.geometry === 'object') {
    geometry = obj.geometry as Record<string, unknown>;
  } else if (obj.type === 'Polygon') {
    geometry = obj;
  }

  if (!geometry || geometry.type !== 'Polygon') return null;
  const coords = geometry.coordinates;
  if (!Array.isArray(coords) || !Array.isArray(coords[0])) return null;

  const ring = coords[0] as unknown[];
  if (ring.length < 4) return null;
  if (!ring.every(isPositionPair)) return null;

  const first = ring[0] as Position;
  const last = ring[ring.length - 1] as Position;
  const closed =
    first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first];

  if ((closed as Position[]).length < 4) return null;

  return {
    type: 'Polygon',
    coordinates: [closed as Position[]],
  };
}

export function validateBoundaryGeoJson(
  input: unknown
): { ok: true; value: BoundaryPolygonGeoJson } | { ok: false; reason: string } {
  const normalized = normalizeToBoundaryPolygonGeoJson(input);
  if (!normalized) {
    return { ok: false, reason: FRIENDLY_INVALID };
  }

  const ring = normalized.coordinates[0];
  if (!ring || ring.length < 4) {
    return { ok: false, reason: 'ring must have at least 3 unique points' };
  }

  const unique = new Set(ring.map(([lng, lat]) => `${lng},${lat}`));
  if (unique.size < 3) {
    return { ok: false, reason: 'need at least 3 unique corner points' };
  }

  for (const [lng, lat] of ring) {
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return { ok: false, reason: 'coordinates out of range' };
    }
  }

  return { ok: true, value: normalized };
}
