import type { IntelligenceEngineOutput } from '@nertura/ai';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface IntelligenceSaveParams {
  conversationId: string;
  analysisId: string;
  userId?: string | null;
  guestId?: string | null;
  organizationId?: string | null;
  assistantMessageId?: string | null;
  intelligence: IntelligenceEngineOutput;
}

export interface IntelligenceSaveResult {
  memoryEventId: string;
  providerOutputIds: string[];
}

export async function saveIntelligenceData(
  supabase: SupabaseClient,
  params: IntelligenceSaveParams
): Promise<IntelligenceSaveResult> {
  const { intelligence, analysisId, conversationId } = params;
  const mem = intelligence.memoryEvent;
  const providerOutputIds: string[] = [];

  const { data: memoryRow, error: memError } = await supabase
    .from('ai_memory_events')
    .insert({
      conversation_id: conversationId,
      analysis_id: analysisId,
      message_id: params.assistantMessageId ?? null,
      user_id: params.userId ?? null,
      guest_id: params.guestId ?? null,
      organization_id: params.organizationId ?? null,
      intent: mem.intent,
      crop: mem.crop,
      disease: mem.disease,
      pest: mem.pest,
      symptoms: mem.symptoms,
      diagnosis: mem.diagnosis,
      treatment: mem.treatment,
      confidence: mem.confidence,
      provider_used: mem.provider_used,
      raw_gemini_output: mem.raw_gemini_output,
      final_nertura_answer: mem.final_nertura_answer,
      entities: mem.entities,
      retrieval_context: mem.retrieval_context,
      reasoning_steps: mem.reasoning_steps,
      feedback_status: 'pending',
      language: mem.language,
    })
    .select('id')
    .single();

  if (memError) throw memError;
  const memoryEventId = memoryRow.id as string;

  const providers: Array<{ provider: string; request_type: string; raw: unknown; model?: string }> =
    [];

  if (intelligence.rawGemini) {
    providers.push({
      provider: 'gemini',
      request_type: intelligence.geminiVisionText ? 'vision' : 'text',
      raw: intelligence.rawGemini,
      model:
        typeof intelligence.rawBrain === 'object' &&
        intelligence.rawBrain &&
        'model' in (intelligence.rawBrain as object)
          ? String((intelligence.rawBrain as { model?: string }).model)
          : undefined,
    });
  }

  if (intelligence.rawOpenai) {
    providers.push({
      provider: 'openai',
      request_type: 'text',
      raw: intelligence.rawOpenai,
    });
  }

  providers.push({
    provider: intelligence.providerUsed,
    request_type: 'synthesis',
    raw: {
      source: intelligence.answer.source,
      confidence: intelligence.answer.confidence,
      brain: intelligence.rawBrain,
    },
  });

  for (const p of providers) {
    const { data: outRow, error: outError } = await supabase
      .from('ai_provider_outputs')
      .insert({
        analysis_id: analysisId,
        conversation_id: conversationId,
        user_id: params.userId ?? null,
        guest_id: params.guestId ?? null,
        provider: p.provider,
        model: p.model ?? null,
        request_type: p.request_type,
        raw_output: p.raw,
      })
      .select('id')
      .single();

    if (outError) throw outError;
    providerOutputIds.push(outRow.id as string);
  }

  const similarCases =
    (mem.retrieval_context.similarCases as Array<{ id?: string; score: number }> | undefined) ??
    [];

  for (const sc of similarCases) {
    if (!sc.id || sc.id === memoryEventId) continue;
    await supabase.from('similar_cases').insert({
      memory_event_id: memoryEventId,
      similar_memory_event_id: sc.id,
      similarity_score: sc.score,
      match_reason: `crop=${mem.crop ?? 'any'}; disease=${mem.disease ?? 'any'}`,
    });
  }

  await supabase
    .from('ai_analyses')
    .update({
      metadata: {
        intelligence: {
          memory_event_id: memoryEventId,
          intent: mem.intent,
          entities: mem.entities,
          evidence_cards: intelligence.evidenceCards,
        },
      },
    })
    .eq('id', analysisId);

  return { memoryEventId, providerOutputIds };
}

export async function findSimilarMemoryEvents(
  supabase: SupabaseClient,
  params: { crop?: string | null; disease?: string | null; limit?: number }
): Promise<Array<{ id: string; crop?: string; diagnosis?: string; score: number }>> {
  if (!params.crop && !params.disease) return [];

  let query = supabase
    .from('ai_memory_events')
    .select('id, crop, diagnosis, confidence, created_at')
    .order('created_at', { ascending: false })
    .limit(params.limit ?? 5);

  if (params.crop) query = query.eq('crop', params.crop);
  if (params.disease) query = query.eq('disease', params.disease);

  const { data } = await query;
  if (!data?.length) return [];

  return data.map((row: { id: string; crop: string | null; diagnosis: string | null }, i: number) => ({
    id: row.id,
    crop: row.crop ?? undefined,
    diagnosis: row.diagnosis ?? undefined,
    score: Math.max(0.5, 0.9 - i * 0.08),
  }));
}

export async function saveFeedback(
  supabase: SupabaseClient,
  params: {
    analysisId: string;
    memoryEventId?: string | null;
    userId?: string | null;
    guestId?: string | null;
    feedbackType: string;
    comment?: string | null;
  }
): Promise<string> {
  const { data, error } = await supabase
    .from('ai_feedback')
    .insert({
      analysis_id: params.analysisId,
      memory_event_id: params.memoryEventId ?? null,
      user_id: params.userId ?? null,
      guest_id: params.guestId ?? null,
      feedback_type: params.feedbackType,
      comment: params.comment ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;

  if (params.memoryEventId) {
    await supabase
      .from('ai_memory_events')
      .update({ feedback_status: params.feedbackType })
      .eq('id', params.memoryEventId);
  }

  return data.id as string;
}
