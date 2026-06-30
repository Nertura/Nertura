import { validateBoundaryGeoJson, type BoundaryPolygonGeoJson } from '@nertura/geo';

export const FRIENDLY_BOUNDARY_SAVE_ERROR =
  'Tarla sınırı kaydedilemedi. Lütfen çizimi temizleyip tekrar deneyin.';

export function parseBoundaryFromRequest(body: unknown): {
  ok: true;
  boundary: BoundaryPolygonGeoJson;
} | {
  ok: false;
  userMessage: string;
  technicalReason: string;
} {
  const raw =
    body && typeof body === 'object' && 'boundaryGeojson' in body
      ? (body as { boundaryGeojson: unknown }).boundaryGeojson
      : body;

  const result = validateBoundaryGeoJson(raw);
  if (!result.ok) {
    return {
      ok: false,
      userMessage: FRIENDLY_BOUNDARY_SAVE_ERROR,
      technicalReason: result.reason,
    };
  }
  return { ok: true, boundary: result.value };
}

export function mapBoundaryRpcError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('geojson') ||
    lower.includes('polygon') ||
    lower.includes('geometry') ||
    lower.includes('invalid')
  ) {
    return FRIENDLY_BOUNDARY_SAVE_ERROR;
  }
  return message;
}
