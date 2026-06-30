import type { SupabaseClient } from '@supabase/supabase-js';

import { relatedName } from '@nertura/utils';

import { signedImageUrl } from '../ai/conversations';

export type CaseListFilter = 'all' | 'open' | 'monitoring' | 'resolved';

export interface CaseListItem {
  id: string;
  cropLabel: string | null;
  diagnosisSummary: string | null;
  status: string;
  progress: string;
  riskLevel: string | null;
  confidence: number | null;
  lastActivityAt: string;
  fieldName: string | null;
  farmName: string | null;
  conversationId: string | null;
  thumbnailUrl: string | null;
}

function matchesSearch(item: CaseListItem, query: string): boolean {
  const q = query.toLowerCase();
  const haystack = [
    item.cropLabel,
    item.diagnosisSummary,
    item.fieldName,
    item.farmName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export async function loadCaseList(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    userId: string;
    filter?: CaseListFilter;
    search?: string;
    limit?: number;
  }
): Promise<CaseListItem[]> {
  let query = supabase
    .from('field_cases')
    .select(
      `
      id, status, progress, crop_label, diagnosis_summary, confidence, risk_level,
      conversation_id, updated_at, last_analysis_id, intake_metadata,
      fields(name, farms(name))
    `
    )
    .eq('organization_id', params.organizationId)
    .eq('user_id', params.userId)
    .order('updated_at', { ascending: false })
    .limit(params.limit ?? 100);

  const filter = params.filter ?? 'all';
  if (filter === 'open') query = query.eq('status', 'open');
  if (filter === 'monitoring') query = query.eq('status', 'monitoring');
  if (filter === 'resolved') query = query.eq('status', 'resolved');

  const { data, error } = await query;
  if (error) throw error;

  const rows = await Promise.all(
    (data ?? []).map(async (row) => {
      const meta = (row.intake_metadata as Record<string, unknown>) ?? {};
      const cropFromMeta = typeof meta.crop === 'string' ? meta.crop : null;
      const fieldsRel = row.fields as
        | { name: string; farms: { name: string } | { name: string }[] | null }
        | { name: string; farms: { name: string } | { name: string }[] | null }[]
        | null;
      const fieldRow = Array.isArray(fieldsRel) ? fieldsRel[0] : fieldsRel;
      const farmsRel = fieldRow?.farms;
      const farmRow = Array.isArray(farmsRel) ? farmsRel[0] : farmsRel;

      let thumbnailUrl: string | null = null;
      const analysisId = row.last_analysis_id as string | null;
      if (analysisId) {
        const { data: img } = await supabase
          .from('analysis_images')
          .select('storage_path')
          .eq('analysis_id', analysisId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (img?.storage_path) {
          thumbnailUrl = await signedImageUrl(supabase, img.storage_path as string);
        }
      }

      const { data: lastEvent } = await supabase
        .from('case_timeline_events')
        .select('created_at')
        .eq('field_case_id', row.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: row.id as string,
        cropLabel: (row.crop_label as string | null) ?? cropFromMeta,
        diagnosisSummary: row.diagnosis_summary as string | null,
        status: row.status as string,
        progress: (row.progress as string) ?? 'monitoring',
        riskLevel: (row.risk_level as string | null) ?? null,
        confidence: row.confidence != null ? Number(row.confidence) : null,
        lastActivityAt:
          (lastEvent?.created_at as string | undefined) ??
          (row.updated_at as string),
        fieldName: relatedName(fieldRow ?? null) ?? null,
        farmName: relatedName(farmRow ?? null) ?? null,
        conversationId: (row.conversation_id as string | null) ?? null,
        thumbnailUrl,
      } satisfies CaseListItem;
    })
  );

  const search = params.search?.trim().toLowerCase();
  if (!search) return rows;
  return rows.filter((item) => matchesSearch(item, search));
}
