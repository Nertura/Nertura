import type { SupabaseClient } from '@supabase/supabase-js';

import type { AgricultureIntent } from '@nertura/ai';
import type { DoctorDiagnosis } from '@nertura/types';

import {
  createAutoFieldCase,
  findOpenCaseForConversation,
  shouldAutoCreateFieldCase,
} from './case-auto-create';
import { syncCaseAfterDiagnosis, linkAnalysisMemoryToCase } from './diagnosis-bridge';
import {
  linkFieldCaseToConversation,
  updateFieldCaseFromDoctor,
  getFieldCaseById,
} from '../intake/field-case-service';

export interface LinkDiagnosisToCaseInput {
  organizationId: string;
  userId: string;
  conversationId: string;
  analysisId: string;
  memoryEventId?: string | null;
  diagnosis: DoctorDiagnosis;
  intent: AgricultureIntent;
  question: string;
  hasImage: boolean;
  imagePath?: string | null;
  explicitCaseId?: string | null;
  fieldId?: string | null;
  existingConversationId?: string | null;
}

export interface LinkDiagnosisToCaseResult {
  caseId: string | null;
  linked: boolean;
  autoCreated: boolean;
}

/**
 * Resolve, create, or attach a field case after Doctor save. Non-fatal on failure.
 */
export async function linkDiagnosisToFieldCase(
  supabase: SupabaseClient,
  input: LinkDiagnosisToCaseInput
): Promise<LinkDiagnosisToCaseResult> {
  let caseId = input.explicitCaseId ?? null;
  let autoCreated = false;

  if (!caseId && input.existingConversationId) {
    caseId = await findOpenCaseForConversation(
      supabase,
      input.organizationId,
      input.existingConversationId
    );
  }

  if (!caseId && shouldAutoCreateFieldCase({
    question: input.question,
    diagnosis: input.diagnosis,
    intent: input.intent,
    hasImage: input.hasImage,
  })) {
    caseId = await createAutoFieldCase(supabase, {
      organizationId: input.organizationId,
      userId: input.userId,
      fieldId: input.fieldId,
      conversationId: input.conversationId,
      question: input.question,
      diagnosis: input.diagnosis,
    });
    autoCreated = Boolean(caseId);
  }

  if (!caseId) {
    return { caseId: null, linked: false, autoCreated: false };
  }

  try {
    await linkFieldCaseToConversation(
      supabase,
      input.organizationId,
      caseId,
      input.conversationId
    );
    await updateFieldCaseFromDoctor(supabase, input.organizationId, caseId, {
      diagnosisSummary: input.diagnosis.diagnosis,
      treatmentPlan: input.diagnosis.treatment,
      preventionPlan: input.diagnosis.prevention,
      severity: input.diagnosis.risk_level,
      status: 'monitoring',
    });

    const fieldCase = await getFieldCaseById(supabase, input.organizationId, caseId);
    if (fieldCase) {
      await syncCaseAfterDiagnosis(supabase, {
        organizationId: input.organizationId,
        userId: input.userId,
        caseId,
        conversationId: input.conversationId,
        analysisId: input.analysisId,
        memoryEventId: input.memoryEventId,
        diagnosis: input.diagnosis,
        imagePath: input.imagePath,
      });
      await linkAnalysisMemoryToCase(supabase, {
        analysisId: input.analysisId,
        userId: input.userId,
        organizationId: input.organizationId,
        fieldCaseId: caseId,
        fieldId: fieldCase.field_id ?? input.fieldId,
        farmId: fieldCase.farm_id,
      });
    }

    return { caseId, linked: true, autoCreated };
  } catch (err) {
    console.error('[projects-engine] linkDiagnosisToFieldCase failed', err);
    return { caseId, linked: false, autoCreated };
  }
}
