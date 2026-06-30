import type { SupabaseClient } from '@supabase/supabase-js';

import type { DoctorDiagnosis } from '@nertura/types';

import { appendCaseTimelineEvent, scheduleCaseNotificationHook } from './timeline-service';
import { hasFollowUpSuggestion } from './case-auto-create';

export interface SyncCaseAfterDiagnosisInput {
  organizationId: string;
  userId: string;
  caseId: string;
  conversationId: string;
  analysisId: string;
  memoryEventId?: string | null;
  diagnosis: DoctorDiagnosis;
  imagePath?: string | null;
  imageAnalysisId?: string | null;
}

/**
 * Projects Engine bridge — runs after Doctor save when a field case is linked.
 * Does not change Doctor API contract; extends existing field_case flow.
 */
export async function syncCaseAfterDiagnosis(
  supabase: SupabaseClient,
  input: SyncCaseAfterDiagnosisInput
): Promise<void> {
  const progress =
    input.diagnosis.risk_level === 'critical' || input.diagnosis.risk_level === 'high'
      ? 'critical'
      : 'monitoring';

  await supabase
    .from('ai_analyses')
    .update({ field_case_id: input.caseId })
    .eq('id', input.analysisId);

  const cropLabel =
    input.diagnosis.matched_slug ??
    (input.diagnosis.sections?.possible_causes
      ? null
      : null);

  await supabase
    .from('field_cases')
    .update({
      last_analysis_id: input.analysisId,
      progress,
      confidence: input.diagnosis.confidence,
      risk_level: input.diagnosis.risk_level,
      crop_label: cropLabel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.caseId)
    .eq('organization_id', input.organizationId);

  if (input.imagePath) {
    await appendCaseTimelineEvent(supabase, {
      fieldCaseId: input.caseId,
      organizationId: input.organizationId,
      userId: input.userId,
      eventType: 'photo_uploaded',
      title: 'Fotoğraf yüklendi',
      summary: 'Yeni bitki fotoğrafı vakaya eklendi.',
      refTable: 'analysis_images',
      refId: input.imageAnalysisId ?? input.analysisId,
      metadata: { storage_path: input.imagePath, conversation_id: input.conversationId },
    });
  }

  await appendCaseTimelineEvent(supabase, {
    fieldCaseId: input.caseId,
    organizationId: input.organizationId,
    userId: input.userId,
    eventType: 'diagnosis_created',
    title: 'Teşhis oluşturuldu',
    summary: input.diagnosis.diagnosis.slice(0, 240),
    refTable: 'ai_analyses',
    refId: input.analysisId,
    metadata: {
      conversation_id: input.conversationId,
      memory_event_id: input.memoryEventId ?? null,
      source: input.diagnosis.source,
      confidence: input.diagnosis.confidence,
    },
  });

  if (input.diagnosis.treatment) {
    await appendCaseTimelineEvent(supabase, {
      fieldCaseId: input.caseId,
      organizationId: input.organizationId,
      userId: input.userId,
      eventType: 'treatment_generated',
      title: 'Tedavi planı oluşturuldu',
      summary: input.diagnosis.treatment.slice(0, 240),
      refTable: 'ai_analyses',
      refId: input.analysisId,
    });
  }

  if (hasFollowUpSuggestion(input.diagnosis)) {
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + 7);
    await scheduleCaseNotificationHook(supabase, {
      fieldCaseId: input.caseId,
      organizationId: input.organizationId,
      userId: input.userId,
      eventType: 'reminder_scheduled',
      title: 'Takip analizi hatırlatması',
      summary: 'Belirtileri kontrol edin ve gerekirse yeni fotoğraf yükleyin.',
      refTable: 'ai_analyses',
      refId: input.analysisId,
      notifyAt: followUp.toISOString(),
      channels: ['in_app', 'email'],
      metadata: { days_since: 7, diagnosis_id: input.analysisId },
    });
  }

  if (input.memoryEventId) {
    // Memory event already stores diagnosis; case link is via analysis + timeline refs.
  }
}

/** Reuse existing memory tables — link analysis to farm/field context. */
export async function linkAnalysisMemoryToCase(
  supabase: SupabaseClient,
  input: {
    analysisId: string;
    userId: string;
    organizationId: string;
    fieldCaseId: string;
    fieldId?: string | null;
    farmId?: string | null;
  }
): Promise<void> {
  const { data: existing } = await supabase
    .from('analysis_memory_links')
    .select('id')
    .eq('diagnosis_id', input.analysisId)
    .maybeSingle();

  if (existing?.id) return;

  await supabase.from('analysis_memory_links').insert({
    diagnosis_id: input.analysisId,
    user_id: input.userId,
    organization_id: input.organizationId,
    field_id: input.fieldId ?? null,
    farm_id: input.farmId ?? null,
  });
}
