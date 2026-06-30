import type { SupabaseClient } from '@supabase/supabase-js';

import { relatedName } from '@nertura/utils';

import type { FieldCaseRow } from '@/lib/intake/field-case-service';
import { listFieldCases } from '@/lib/intake/field-case-service';

import { computeFieldHealthScore, type FieldHealthScore } from './health-score';
import { buildPlaceholderRecommendations, type FieldRecommendation } from './recommendations';

export interface DashboardFieldCard {
  id: string;
  name: string;
  farmId: string;
  farmName: string | null;
  crop: string | null;
  areaHa: number | null;
  locationLabel: string | null;
  health: FieldHealthScore;
  openCases: number;
  monitoringCases: number;
  lastAiVisit: string | null;
  hasBoundary: boolean;
}

export interface DashboardHomeData {
  userFirstName: string;
  fields: DashboardFieldCard[];
  activeCases: FieldCaseRow[];
  recommendations: FieldRecommendation[];
  lastConversationId: string | null;
  lastConversationTitle: string | null;
}

function firstName(email: string, orgName: string): string {
  const local = email.split('@')[0]?.split(/[._]/)[0];
  if (local && local.length > 1) return local.charAt(0).toUpperCase() + local.slice(1);
  return orgName.split(' ')[0] ?? 'Farmer';
}

function locationFromFarmAddress(address: unknown): string | null {
  if (!address || typeof address !== 'object') return null;
  const a = address as { city?: string; district?: string; country?: string };
  return [a.district, a.city, a.country].filter(Boolean).join(', ') || null;
}

export async function loadDashboardHomeData(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  email: string,
  organizationName: string
): Promise<DashboardHomeData> {
  const { data: fieldsRaw } = await supabase
    .from('fields')
    .select('id, name, farm_id, area, area_m2, metadata, updated_at, farms(name, address)')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(12);

  const cases = await listFieldCases(supabase, { organizationId, limit: 20 });

  const activeCases = cases.filter((c) => c.status === 'open' || c.status === 'monitoring');

  const fieldCards: DashboardFieldCard[] = (fieldsRaw ?? []).map((row) => {
    const meta = (row.metadata ?? {}) as { boundary_geojson?: unknown; field_type?: string };
    const farmRel = row.farms as { name: string; address?: unknown } | { name: string; address?: unknown }[] | null;
    const farm = Array.isArray(farmRel) ? farmRel[0] : farmRel;
    const fieldCases = cases.filter((c) => c.field_id === row.id);
    const openCases = fieldCases.filter((c) => c.status === 'open').length;
    const monitoringCases = fieldCases.filter((c) => c.status === 'monitoring').length;
    const highSeverity = fieldCases.filter(
      (c) => c.severity === 'high' || c.severity === 'critical'
    ).length;
    const hasBoundary = Boolean(meta.boundary_geojson);
    const cropFromCase = fieldCases[0]?.intake_metadata as { cropLabel?: string } | undefined;

    const health = computeFieldHealthScore({
      hasBoundary,
      openCases,
      monitoringCases,
      highSeverityCases: highSeverity,
      hasCrop: Boolean(cropFromCase?.cropLabel),
      hasRecentDiagnosis: fieldCases.some((c) => c.diagnosis_summary),
    });

    const lastCase = fieldCases[0];

    return {
      id: row.id as string,
      name: row.name as string,
      farmId: row.farm_id as string,
      farmName: farm?.name ?? relatedName(row.farms) ?? null,
      crop: cropFromCase?.cropLabel ?? null,
      areaHa: row.area != null ? Number(row.area) : null,
      locationLabel: locationFromFarmAddress(farm?.address),
      health,
      openCases,
      monitoringCases,
      lastAiVisit: lastCase?.updated_at ?? (row.updated_at as string),
      hasBoundary,
    };
  });

  const recommendations = buildPlaceholderRecommendations({
    fields: fieldCards.map((f) => ({
      id: f.id,
      name: f.name,
      crop: f.crop,
      hasBoundary: f.hasBoundary,
      healthLabel: f.health.label,
    })),
    cases: activeCases,
  });

  const { data: lastConv } = await supabase
    .from('ai_conversations')
    .select('id, title')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    userFirstName: firstName(email, organizationName),
    fields: fieldCards,
    activeCases: activeCases.slice(0, 6),
    recommendations,
    lastConversationId: lastConv?.id ?? null,
    lastConversationTitle: lastConv?.title ?? null,
  };
}
