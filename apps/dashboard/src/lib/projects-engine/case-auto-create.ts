import type { SupabaseClient } from '@supabase/supabase-js';

import type { AgricultureIntent } from '@nertura/ai';
import { extractEntities } from '@nertura/ai';
import type { DoctorDiagnosis } from '@nertura/types';

import { appendCaseTimelineEvent } from './timeline-service';

const GREETING_ONLY =
  /^(merhaba|selam|hello|hi|hey|günaydın|gunaydin|iyi günler|iyi gunler|nasılsın|nasilsin)[\s!.,?]*$/i;

const NON_AGRICULTURE =
  /^(hesap|abonelik|fatura|şifre|sifre|login|giriş|giris|yardım|yardim|help|support|nertura plus|kredi)/i;

const INFO_ONLY_PATTERNS = [
  /fotoğraf.*yükle/i,
  /fotograf.*yukle/i,
  /daha fazla bilgi/i,
  /please (upload|provide|send)/i,
  /upload a photo/i,
];

const AGRICULTURE_INTENTS = new Set<AgricultureIntent>([
  'diagnosis',
  'pest',
  'fertilizer',
  'irrigation',
  'soil',
  'crop_care',
  'weather_risk',
  'farm_history',
]);

export interface ShouldAutoCreateCaseInput {
  question: string;
  diagnosis: DoctorDiagnosis;
  intent: AgricultureIntent;
  hasImage: boolean;
}

/** Decide if a Doctor diagnosis should become a living field case. */
export function shouldAutoCreateFieldCase(input: ShouldAutoCreateCaseInput): boolean {
  const q = input.question.trim();
  if (!q && !input.hasImage) return false;
  if (GREETING_ONLY.test(q)) return false;
  if (NON_AGRICULTURE.test(q)) return false;

  const entities = extractEntities(q);
  const hasCrop =
    Boolean(input.diagnosis.matched_slug) ||
    entities.crops.length > 0 ||
    Boolean(input.diagnosis.sections?.short_diagnosis?.trim());

  const hasDiagnosisTitle = Boolean(input.diagnosis.diagnosis?.trim().length > 24);
  const hasTreatment = Boolean(input.diagnosis.treatment?.trim().length > 12);
  const hasAgIntent = AGRICULTURE_INTENTS.has(input.intent);

  if (input.hasImage) return true;
  if (hasCrop && (hasDiagnosisTitle || hasTreatment)) return true;
  if (hasTreatment && hasAgIntent) return true;
  if (hasAgIntent && hasDiagnosisTitle && input.diagnosis.confidence >= 0.45) return true;

  if (isInfoOnlyDiagnosis(input.diagnosis)) return false;

  return false;
}

function isInfoOnlyDiagnosis(diagnosis: DoctorDiagnosis): boolean {
  if (diagnosis.confidence >= 0.72 && diagnosis.treatment?.trim()) return false;
  if (diagnosis.matched_slug) return false;
  const text = diagnosis.diagnosis.toLowerCase();
  const asksOnly =
    INFO_ONLY_PATTERNS.some((p) => p.test(text)) &&
    !diagnosis.treatment?.trim() &&
    diagnosis.confidence < 0.65;
  return asksOnly;
}

export function hasFollowUpSuggestion(diagnosis: DoctorDiagnosis): boolean {
  const blob = [diagnosis.prevention, diagnosis.notes, diagnosis.treatment]
    .filter(Boolean)
    .join(' ');
  return /takip|kontrol|yeniden|tekrar|follow.?up|7 gün|bir hafta|hafta sonra|gün sonra/i.test(blob);
}

export function resolveCropLabel(question: string, diagnosis: DoctorDiagnosis): string | null {
  if (diagnosis.matched_slug) return diagnosis.matched_slug;
  const entities = extractEntities(question);
  if (entities.crops[0]) return entities.crops[0];
  if (diagnosis.sections?.short_diagnosis) {
    return diagnosis.sections.short_diagnosis.slice(0, 80);
  }
  return null;
}

export async function findOpenCaseForConversation(
  supabase: SupabaseClient,
  organizationId: string,
  conversationId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('field_cases')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('conversation_id', conversationId)
    .in('status', ['open', 'monitoring'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.id as string | undefined) ?? null;
}

export interface CreateAutoFieldCaseInput {
  organizationId: string;
  userId: string;
  fieldId?: string | null;
  conversationId: string;
  question: string;
  diagnosis: DoctorDiagnosis;
}

export async function createAutoFieldCase(
  supabase: SupabaseClient,
  input: CreateAutoFieldCaseInput
): Promise<string | null> {
  let farmId: string | null = null;
  if (input.fieldId) {
    const { data: field } = await supabase
      .from('fields')
      .select('farm_id')
      .eq('id', input.fieldId)
      .eq('organization_id', input.organizationId)
      .maybeSingle();
    farmId = (field?.farm_id as string | null) ?? null;
  }

  const cropLabel = resolveCropLabel(input.question, input.diagnosis);
  const progress =
    input.diagnosis.risk_level === 'critical' || input.diagnosis.risk_level === 'high'
      ? 'critical'
      : 'monitoring';

  const { data, error } = await supabase
    .from('field_cases')
    .insert({
      organization_id: input.organizationId,
      user_id: input.userId,
      field_id: input.fieldId ?? null,
      farm_id: farmId,
      conversation_id: input.conversationId,
      status: 'monitoring',
      progress,
      raw_intake: input.question,
      symptom: input.question.slice(0, 240),
      diagnosis_summary: input.diagnosis.diagnosis.slice(0, 500),
      treatment_plan: input.diagnosis.treatment,
      prevention_plan: input.diagnosis.prevention,
      severity: input.diagnosis.risk_level,
      crop_label: cropLabel,
      confidence: input.diagnosis.confidence,
      risk_level: input.diagnosis.risk_level,
      intake_metadata: {
        auto_created: true,
        source: 'doctor',
        crop: cropLabel,
      },
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    console.error('[projects-engine] auto case create failed', error?.message);
    return null;
  }

  const caseId = data.id as string;

  await appendCaseTimelineEvent(supabase, {
    fieldCaseId: caseId,
    organizationId: input.organizationId,
    userId: input.userId,
    eventType: 'case_created',
    title: 'Vaka oluşturuldu',
    summary: input.diagnosis.diagnosis.slice(0, 240),
    refTable: 'field_cases',
    refId: caseId,
    metadata: { conversation_id: input.conversationId, auto_created: true },
  });

  return caseId;
}

export function buildCaseContextBlock(
  overview: {
    crop: string | null;
    currentDiagnosis: string | null;
    status: string;
    progress: string;
    nextRecommendation: string | null;
  } | null
): string | undefined {
  if (!overview) return undefined;
  const lines = ['[Vaka takibi — devam eden vaka]'];
  if (overview.crop) lines.push(`Bitki/ürün: ${overview.crop}`);
  if (overview.currentDiagnosis) lines.push(`Son teşhis: ${overview.currentDiagnosis.slice(0, 400)}`);
  lines.push(`Durum: ${overview.status} / ${overview.progress}`);
  if (overview.nextRecommendation) lines.push(`Öneri: ${overview.nextRecommendation.slice(0, 200)}`);
  lines.push('Bu vaka için takip ve tutarlı öneriler ver.');
  return lines.join('\n');
}
