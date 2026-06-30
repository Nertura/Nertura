import type { SupabaseClient } from '@supabase/supabase-js';

import type { FieldCaseRow } from '@/lib/intake/field-case-service';
import { listFieldCases } from '@/lib/intake/field-case-service';
import { loadFieldIntelligenceContext } from '@/lib/onboarding/farm-profile-loader';

import { computeFieldHealthScore, type FieldHealthScore } from './health-score';
import { buildPlaceholderRecommendations, type FieldRecommendation } from './recommendations';

export interface FieldWorkspaceData {
  fieldId: string;
  fieldName: string;
  farmId: string;
  farmName: string | null;
  locationLabel: string | null;
  areaHa: number | null;
  areaM2: number | null;
  soilType: string | null;
  fieldStatus: string;
  crop: string | null;
  crops: Array<{ id: string; crop_name: string; season: string; status: string }>;
  health: FieldHealthScore;
  cases: FieldCaseRow[];
  recommendations: FieldRecommendation[];
  lastDiagnosis: string | null;
  lastDiagnosisAt: string | null;
  lastIrrigation: string | null;
  lastFertilizer: string | null;
  hasBoundary: boolean;
  canWrite: boolean;
}

export async function loadFieldWorkspaceData(
  supabase: SupabaseClient,
  organizationId: string,
  fieldId: string,
  canWrite: boolean
): Promise<FieldWorkspaceData | null> {
  const ctx = await loadFieldIntelligenceContext(supabase, organizationId, fieldId);
  if (!ctx) return null;

  const { data: fieldRow } = await supabase
    .from('fields')
    .select('status, metadata')
    .eq('id', fieldId)
    .maybeSingle();

  const { data: crops } = await supabase
    .from('crops')
    .select('id, crop_name, season, status')
    .eq('field_id', fieldId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const cases = await listFieldCases(supabase, {
    organizationId,
    fieldId,
    limit: 30,
  });

  const activeCases = cases.filter((c) => c.status === 'open' || c.status === 'monitoring');
  const highSeverity = cases.filter(
    (c) => c.severity === 'high' || c.severity === 'critical'
  ).length;
  const primaryCrop = (crops ?? [])[0]?.crop_name ?? ctx.cropsOnField?.[0] ?? null;
  const lastDiagnosed = cases.find((c) => c.diagnosis_summary);
  const hasBoundary = Boolean(ctx.hasBoundary);

  const health = computeFieldHealthScore({
    hasBoundary,
    openCases: cases.filter((c) => c.status === 'open').length,
    monitoringCases: cases.filter((c) => c.status === 'monitoring').length,
    highSeverityCases: highSeverity,
    hasCrop: Boolean(primaryCrop),
    hasRecentDiagnosis: Boolean(lastDiagnosed),
  });

  const recommendations = buildPlaceholderRecommendations({
    fields: [
      {
        id: fieldId,
        name: ctx.fieldName,
        crop: primaryCrop,
        hasBoundary,
        healthLabel: health.label,
      },
    ],
    cases: activeCases,
  });

  const meta = (fieldRow?.metadata ?? {}) as {
    last_irrigation?: string;
    last_fertilizer?: string;
  };

  return {
    fieldId: ctx.fieldId,
    fieldName: ctx.fieldName,
    farmId: ctx.farmId,
    farmName: ctx.farmName ?? null,
    locationLabel: ctx.locationLabel ?? null,
    areaHa: ctx.areaHectares ?? null,
    areaM2: ctx.areaM2 ?? null,
    soilType: ctx.soilType ?? null,
    fieldStatus: (fieldRow?.status as string) ?? 'active',
    crop: primaryCrop,
    crops: (crops ?? []) as Array<{ id: string; crop_name: string; season: string; status: string }>,
    health,
    cases,
    recommendations: recommendations.slice(0, 5),
    lastDiagnosis: lastDiagnosed?.diagnosis_summary ?? null,
    lastDiagnosisAt: lastDiagnosed?.updated_at ?? null,
    lastIrrigation: meta.last_irrigation ?? null,
    lastFertilizer: meta.last_fertilizer ?? null,
    hasBoundary,
    canWrite,
  };
}

export function fieldDisplayLocation(data: Pick<FieldWorkspaceData, 'locationLabel' | 'farmName'>): string {
  return data.locationLabel ?? data.farmName ?? 'your farm';
}
