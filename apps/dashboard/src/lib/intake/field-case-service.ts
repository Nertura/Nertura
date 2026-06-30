import type { SupabaseClient } from '@supabase/supabase-js';

import type { FarmIntakeParseResult } from '@nertura/ai';

export interface FieldCaseRow {
  id: string;
  status: 'open' | 'monitoring' | 'resolved';
  field_id: string | null;
  farm_id: string | null;
  conversation_id: string | null;
  symptom: string | null;
  severity: string | null;
  diagnosis_summary: string | null;
  treatment_plan?: string | null;
  prevention_plan?: string | null;
  follow_up_date?: string | null;
  raw_intake: string | null;
  created_at: string;
  updated_at: string;
  intake_metadata?: Record<string, unknown>;
}

export async function listFieldCases(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    fieldId?: string | null;
    status?: 'open' | 'monitoring' | 'resolved';
    limit?: number;
  }
): Promise<FieldCaseRow[]> {
  let query = supabase
    .from('field_cases')
    .select(
      'id, status, field_id, farm_id, conversation_id, symptom, severity, diagnosis_summary, treatment_plan, prevention_plan, follow_up_date, raw_intake, created_at, updated_at, intake_metadata'
    )
    .eq('organization_id', params.organizationId)
    .order('updated_at', { ascending: false })
    .limit(params.limit ?? 50);

  if (params.fieldId) query = query.eq('field_id', params.fieldId);
  if (params.status) query = query.eq('status', params.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FieldCaseRow[];
}

export interface CreateFieldCaseInput {
  organizationId: string;
  userId: string;
  farmId?: string | null;
  fieldId?: string | null;
  conversationId?: string | null;
  intake: FarmIntakeParseResult;
  status?: 'open' | 'monitoring' | 'resolved';
}

export async function createFieldCase(
  supabase: SupabaseClient,
  input: CreateFieldCaseInput
) {
  const { data, error } = await supabase
    .from('field_cases')
    .insert({
      organization_id: input.organizationId,
      user_id: input.userId,
      farm_id: input.farmId ?? null,
      field_id: input.fieldId ?? null,
      conversation_id: input.conversationId ?? null,
      status: input.status ?? 'open',
      raw_intake: input.intake.rawText,
      symptom: input.intake.symptom ?? input.intake.problem,
      severity: input.intake.urgency,
      intake_metadata: {
        location: input.intake.location,
        crop: input.intake.crop,
        cropLabel: input.intake.cropLabel,
        statedArea: input.intake.statedArea,
        areaUnit: input.intake.areaUnit,
        missingFields: input.intake.missingFields,
        confidence: input.intake.confidence,
      },
    })
    .select('id, status, field_id, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function linkFieldCaseToField(
  supabase: SupabaseClient,
  caseId: string,
  fieldId: string
) {
  const { error } = await supabase
    .from('field_cases')
    .update({ field_id: fieldId, updated_at: new Date().toISOString() })
    .eq('id', caseId);
  if (error) throw error;
}

export async function linkFieldCaseToConversation(
  supabase: SupabaseClient,
  organizationId: string,
  caseId: string,
  conversationId: string
) {
  const { error } = await supabase
    .from('field_cases')
    .update({ conversation_id: conversationId, updated_at: new Date().toISOString() })
    .eq('id', caseId)
    .eq('organization_id', organizationId);
  if (error) throw error;
}

export async function getFieldCaseById(
  supabase: SupabaseClient,
  organizationId: string,
  caseId: string
): Promise<FieldCaseRow | null> {
  const { data, error } = await supabase
    .from('field_cases')
    .select(
      'id, status, field_id, farm_id, conversation_id, symptom, severity, diagnosis_summary, treatment_plan, prevention_plan, follow_up_date, raw_intake, created_at, updated_at, intake_metadata'
    )
    .eq('id', caseId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw error;
  return (data as FieldCaseRow | null) ?? null;
}

export async function updateFieldCaseStatus(
  supabase: SupabaseClient,
  organizationId: string,
  caseId: string,
  update: {
    status?: 'open' | 'monitoring' | 'resolved';
    archived?: boolean;
  }
) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const shouldTouchMetadata =
    update.archived !== undefined ||
    update.status === 'open' ||
    update.status === 'monitoring';

  if (shouldTouchMetadata) {
    const { data: existing } = await supabase
      .from('field_cases')
      .select('intake_metadata')
      .eq('id', caseId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    const meta = (existing?.intake_metadata as Record<string, unknown>) ?? {};

    if (update.archived !== undefined) {
      payload.intake_metadata = { ...meta, archived: update.archived };
      if (update.archived) payload.status = 'resolved';
    } else if (update.status === 'open' || update.status === 'monitoring') {
      payload.intake_metadata = { ...meta, archived: false };
    }
  }

  if (update.status) payload.status = update.status;

  const { data, error } = await supabase
    .from('field_cases')
    .update(payload)
    .eq('id', caseId)
    .eq('organization_id', organizationId)
    .select(
      'id, status, field_id, farm_id, conversation_id, symptom, severity, diagnosis_summary, treatment_plan, prevention_plan, follow_up_date, raw_intake, created_at, updated_at, intake_metadata'
    )
    .single();

  if (error) throw error;
  return data as FieldCaseRow;
}

export async function updateFieldCaseFromDoctor(
  supabase: SupabaseClient,
  organizationId: string,
  caseId: string,
  update: {
    diagnosisSummary?: string;
    treatmentPlan?: string;
    preventionPlan?: string;
    severity?: string;
    status?: 'open' | 'monitoring' | 'resolved';
    followUpDate?: string | null;
  }
) {
  const { error } = await supabase
    .from('field_cases')
    .update({
      diagnosis_summary: update.diagnosisSummary,
      treatment_plan: update.treatmentPlan,
      prevention_plan: update.preventionPlan,
      severity: update.severity,
      status: update.status,
      follow_up_date: update.followUpDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', caseId)
    .eq('organization_id', organizationId);
  if (error) throw error;
}
