import type { DoctorDiagnosis } from '@nertura/types';
import type { SupabaseClient } from '@supabase/supabase-js';

import { formatDiagnosisMessage } from '@/lib/doctor-format';

export interface GuestDoctorSaveResult {
  conversationId: string;
  userMessageId: string;
  assistantMessageId: string;
  analysisId: string;
}

export async function saveGuestDoctorSession(
  admin: SupabaseClient,
  params: {
    guestId: string;
    conversationId?: string;
    question: string;
    diagnosis: DoctorDiagnosis;
    pipeline: {
      rawGemini: unknown;
      rawOpenai: unknown;
      rawBrain: unknown;
      knowledgeHits: unknown;
    };
  }
): Promise<GuestDoctorSaveResult> {
  const assistantContent = formatDiagnosisMessage(params.diagnosis);

  const { data, error } = await admin.rpc('save_guest_doctor_turn', {
    p_guest_id: params.guestId,
    p_conversation_id: params.conversationId ?? null,
    p_question: params.question,
    p_assistant_content: assistantContent,
    p_diagnosis: params.diagnosis,
    p_raw_gemini: params.pipeline.rawGemini,
    p_raw_openai: params.pipeline.rawOpenai,
    p_raw_brain: params.pipeline.rawBrain,
    p_knowledge_hits: params.pipeline.knowledgeHits,
  });

  if (error) throw error;

  const result = data as {
    conversationId: string;
    userMessageId: string;
    assistantMessageId: string;
    analysisId: string;
  };

  if (!result?.conversationId) {
    throw new Error('Conversation could not be saved');
  }

  return {
    conversationId: result.conversationId,
    userMessageId: result.userMessageId,
    assistantMessageId: result.assistantMessageId,
    analysisId: result.analysisId,
  };
}
