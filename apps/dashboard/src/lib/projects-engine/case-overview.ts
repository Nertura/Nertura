import type { SupabaseClient } from '@supabase/supabase-js';

import type { CaseOverview, CasePhotoRef, CaseProgress } from '@nertura/types';
import { relatedName } from '@nertura/utils';

function cropFromMetadata(meta: Record<string, unknown> | undefined): string | null {
  if (!meta) return null;
  const crop = meta.crop ?? meta.cropLabel;
  return typeof crop === 'string' ? crop : null;
}

function mapRiskLevel(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export async function loadCaseOverview(
  supabase: SupabaseClient,
  organizationId: string,
  caseId: string
): Promise<CaseOverview | null> {
  const { data: row, error } = await supabase
    .from('field_cases')
    .select(
      `
      id, status, progress, field_id, farm_id, conversation_id,
      diagnosis_summary, severity, treatment_plan, prevention_plan,
      confidence, risk_level, crop_label, intake_metadata,
      created_at, updated_at, last_analysis_id,
      fields(name)
    `
    )
    .eq('id', caseId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;

  const meta = (row.intake_metadata as Record<string, unknown>) ?? {};
  const crop =
    (row.crop_label as string | null) ??
    cropFromMetadata(meta);

  const { count: analysisCount } = await supabase
    .from('ai_analyses')
    .select('id', { count: 'exact', head: true })
    .eq('field_case_id', caseId);

  const { data: analyses } = await supabase
    .from('ai_analyses')
    .select('id, diagnosis, confidence, created_at')
    .eq('field_case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(1);

  const lastAnalysis = analyses?.[0];
  const analysisIdForPhoto =
    (row.last_analysis_id as string | null) ?? (lastAnalysis?.id as string | undefined);

  let lastPhoto: CasePhotoRef | null = null;
  let photoCount = 0;

  if (analysisIdForPhoto) {
    const { data: images, count } = await supabase
      .from('analysis_images')
      .select('id, analysis_id, storage_path, mime_type, created_at', { count: 'exact' })
      .eq('analysis_id', analysisIdForPhoto)
      .order('created_at', { ascending: false })
      .limit(1);

    photoCount = count ?? images?.length ?? 0;
    const img = images?.[0];
    if (img) {
      lastPhoto = {
        id: img.id as string,
        analysisId: img.analysis_id as string,
        storagePath: img.storage_path as string,
        mimeType: img.mime_type as string,
        createdAt: img.created_at as string,
      };
    }
  }

  const { data: lastTimeline } = await supabase
    .from('case_timeline_events')
    .select('created_at')
    .eq('field_case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastActivityAt =
    (lastTimeline?.created_at as string | undefined) ??
    (lastAnalysis?.created_at as string | undefined) ??
    (row.updated_at as string);

  const nextRecommendation =
    (row.treatment_plan as string | null)?.split('\n')[0]?.trim() ??
    (row.prevention_plan as string | null)?.split('\n')[0]?.trim() ??
    null;

  return {
    id: row.id as string,
    status: row.status as CaseOverview['status'],
    progress: (row.progress as CaseProgress) ?? 'monitoring',
    crop,
    fieldId: (row.field_id as string | null) ?? null,
    fieldName: relatedName(row.fields as { name: string } | { name: string }[] | null) ?? null,
    farmId: (row.farm_id as string | null) ?? null,
    conversationId: (row.conversation_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    riskLevel: mapRiskLevel(row.risk_level ?? row.severity),
    confidence:
      row.confidence != null
        ? Number(row.confidence)
        : lastAnalysis?.confidence != null
          ? Number(lastAnalysis.confidence)
          : null,
    currentDiagnosis:
      (row.diagnosis_summary as string | null) ??
      (lastAnalysis?.diagnosis as string | null) ??
      null,
    lastPhoto,
    lastActivityAt,
    nextRecommendation,
    analysisCount: analysisCount ?? 0,
    photoCount,
  };
}

/** History evolution prep — group conversations under their linked case. */
export async function loadCaseGroupedConversations(
  supabase: SupabaseClient,
  userId: string,
  limit = 50
) {
  const { data: cases, error } = await supabase
    .from('field_cases')
    .select(
      'id, status, progress, crop_label, diagnosis_summary, conversation_id, updated_at, intake_metadata, fields(name)'
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const grouped = await Promise.all(
    (cases ?? []).map(async (c) => {
      const conversationIds = new Set<string>();
      if (c.conversation_id) conversationIds.add(c.conversation_id as string);

      const { data: linkedAnalyses } = await supabase
        .from('ai_analyses')
        .select('conversation_id')
        .eq('field_case_id', c.id)
        .not('conversation_id', 'is', null);

      for (const a of linkedAnalyses ?? []) {
        if (a.conversation_id) conversationIds.add(a.conversation_id as string);
      }

      return {
        caseId: c.id as string,
        title:
          (c.diagnosis_summary as string | null)?.slice(0, 80) ??
          (c.crop_label as string | null) ??
          relatedName(c.fields as { name: string } | { name: string }[] | null) ??
          'Vaka',
        status: c.status,
        progress: c.progress,
        updatedAt: c.updated_at as string,
        conversationIds: [...conversationIds],
      };
    })
  );

  return grouped;
}

export async function loadCaseTasks(
  supabase: SupabaseClient,
  caseId: string,
  limit = 20
) {
  const { data, error } = await supabase
    .from('case_tasks')
    .select('id, title, description, status, source, due_at, created_at, completed_at')
    .eq('field_case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    status: row.status as string,
    source: row.source as string,
    dueAt: (row.due_at as string | null) ?? null,
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string | null) ?? null,
  }));
}

export async function loadCasePhotos(
  supabase: SupabaseClient,
  caseId: string,
  signUrl: (path: string) => Promise<string | null>,
  limit = 24
) {
  const { data: analyses } = await supabase
    .from('ai_analyses')
    .select('id')
    .eq('field_case_id', caseId)
    .order('created_at', { ascending: false });

  const analysisIds = (analyses ?? []).map((a) => a.id as string);
  if (analysisIds.length === 0) return [];

  const { data: images, error } = await supabase
    .from('analysis_images')
    .select('id, analysis_id, storage_path, mime_type, created_at')
    .in('analysis_id', analysisIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const photos = await Promise.all(
    (images ?? []).map(async (img) => ({
      id: img.id as string,
      analysisId: img.analysis_id as string,
      storagePath: img.storage_path as string,
      mimeType: img.mime_type as string,
      createdAt: img.created_at as string,
      url: await signUrl(img.storage_path as string),
    }))
  );

  return photos.filter((p) => p.url);
}
