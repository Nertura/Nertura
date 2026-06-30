/** Build canonical farm map URL after intake confirm / farm selection. */
export interface IntakeMapHandoffParams {
  location?: string | null;
  crop?: string | null;
  statedArea?: string | null;
  areaUnit?: string | null;
  symptom?: string | null;
  fieldId?: string | null;
}

export function parseIntakeHandoffFromSearch(
  search: Record<string, string | string[] | undefined>
): IntakeMapHandoffParams {
  const pick = (key: string) => {
    const v = search[key];
    return typeof v === 'string' ? v : undefined;
  };
  return {
    location: pick('location'),
    crop: pick('crop'),
    statedArea: pick('statedArea'),
    areaUnit: pick('areaUnit'),
    symptom: pick('symptom'),
    fieldId: pick('field'),
  };
}

export function buildFarmMapIntakeUrl(
  farmId: string,
  params: IntakeMapHandoffParams
): string {
  const sp = new URLSearchParams();
  sp.set('intake', '1');
  sp.set('draw', '1');
  if (params.location?.trim()) sp.set('location', params.location.trim());
  if (params.crop?.trim()) sp.set('crop', params.crop.trim());
  if (params.statedArea?.trim()) sp.set('statedArea', params.statedArea.trim());
  if (params.areaUnit?.trim()) sp.set('areaUnit', params.areaUnit.trim());
  if (params.symptom?.trim()) sp.set('symptom', params.symptom.trim());
  if (params.fieldId?.trim()) sp.set('field', params.fieldId.trim());
  return `/farms/${farmId}/map?${sp.toString()}`;
}

export function buildFarmMapIntakeUrlFromSession(farmId: string): string {
  if (typeof window === 'undefined') return `/farms/${farmId}/map?intake=1&draw=1`;
  try {
    const raw = sessionStorage.getItem('nertura_farm_intake');
    if (!raw) return `/farms/${farmId}/map?intake=1&draw=1`;
    const intake = JSON.parse(raw) as {
      location?: { searchLabel?: string };
      crop?: string | null;
      cropLabel?: string | null;
      statedArea?: number | null;
      areaUnit?: string | null;
      symptom?: string | null;
      problem?: string | null;
    };
    return buildFarmMapIntakeUrl(farmId, {
      location: intake.location?.searchLabel ?? null,
      crop: intake.cropLabel ?? intake.crop ?? null,
      statedArea: intake.statedArea != null ? String(intake.statedArea) : null,
      areaUnit: intake.areaUnit ?? 'donum',
      symptom: intake.symptom ?? intake.problem ?? null,
    });
  } catch {
    return `/farms/${farmId}/map?intake=1&draw=1`;
  }
}
