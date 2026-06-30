import {
  DOCTOR_DISCLAIMER,
  formatNaturalDoctorSummary,
  getImageOnlyPrompt,
  runIntelligenceEngine,
  extractEntities,
  answerToDiagnosis,
  type ConversationLanguage,
} from '@nertura/ai';
import type { DoctorDiagnosis } from '@nertura/types';
import type { SupabaseClient } from '@supabase/supabase-js';

import { findSimilarMemoryEvents, saveIntelligenceData } from './intelligence-persistence';
import { loadMemoryContext, persistDiagnosisMemory } from './memory-engine';
import { loadFarmIntelligenceProfile } from '@/lib/onboarding/farm-profile-loader';
import { isMissingLanguageColumnError } from '@/lib/ai/doctor-errors';

export { answerToDiagnosis };

export function formatDiagnosisMessage(d: DoctorDiagnosis): string {
  if (d.formatted) return d.formatted;
  const lang = d.language ?? 'tr';
  return formatNaturalDoctorSummary(
    {
      diagnosis: d.diagnosis,
      symptoms: d.symptoms,
      risk_level: d.risk_level,
      treatment: d.treatment,
      prevention: d.prevention,
      notes: d.notes,
      confidence: d.confidence,
      source: d.source,
      disclaimer: d.disclaimer || DOCTOR_DISCLAIMER,
      sections: d.sections,
      language: lang,
    },
    lang
  );
}

export async function runDoctorAnalysis(
  supabase: SupabaseClient,
  params: {
    question: string;
    imageBase64?: string | null;
    imageMimeType?: string | null;
    userId?: string;
    organizationId?: string | null;
    fieldId?: string | null;
    caseContextBlock?: string | null;
    conversationHistory?: Array<{ role: string; content: string }>;
    language: ConversationLanguage;
  }
) {
  const entities = extractEntities(params.question);

  const farmProfile = params.organizationId
    ? await loadFarmIntelligenceProfile(supabase, params.organizationId, {
        fieldId: params.fieldId,
      }).catch(() => null)
    : null;

  const memoryCtx = params.userId
    ? await loadMemoryContext(supabase, {
        userId: params.userId,
        organizationId: params.organizationId,
        crop: entities.crops[0] ?? null,
        disease: entities.diseases[0] ?? null,
        climateZone: entities.season,
      }).catch(() => null)
    : null;

  const legacySimilar = await findSimilarMemoryEvents(supabase, {
      crop: entities.crops[0] ?? null,
      disease: entities.diseases[0] ?? null,
      limit: 5,
    }).catch(() => []);

  const similarCases =
    memoryCtx?.rankedSimilarCases ??
    legacySimilar.map((c) => ({
      id: c.id,
      memoryEventId: c.id,
      crop: c.crop,
      diagnosis: c.diagnosis,
      score: c.score,
      rankReason: 'recency',
    }));

  return runIntelligenceEngine(
    supabase,
    {
      question: params.question,
      imageBase64: params.imageBase64,
      imageMimeType: params.imageMimeType,
      farmProfile,
      conversationHistory: params.conversationHistory,
      language: params.language,
      memoryContextBlock: params.caseContextBlock ?? undefined,
    },
    {
      conversationHistory: params.conversationHistory,
      similarCases,
      farmProfile,
      farmMemory: memoryCtx?.farms.map((f) => ({
        farmName: f.farmName,
        location: farmProfile?.locationLabel,
        crops: farmProfile?.crops,
        siteType: farmProfile?.siteType,
      })),
      projectMemory: memoryCtx?.projects.map((p) => ({ projectName: p.projectName })),
      diseaseHistory: memoryCtx?.diseaseHistory.map((h) => ({
        crop: h.crop,
        disease: h.disease,
        occurrenceCount: h.occurrenceCount,
        lastOutcome: h.lastOutcome,
      })),
      weather: memoryCtx?.weather ?? {
        location: farmProfile?.locationLabel ?? entities.location,
        climateZone: entities.season,
      },
      outcomeStats: memoryCtx?.outcomeStats,
    }
  );
}

async function updateConversationRow(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
  payload: {
    title: string;
    updated_at: string;
    language: ConversationLanguage;
    metadata: Record<string, unknown>;
  }
): Promise<void> {
  const { error } = await supabase
    .from('ai_conversations')
    .update({
      title: payload.title,
      updated_at: payload.updated_at,
      language: payload.language,
      metadata: payload.metadata,
    })
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (!error) return;

  if (isMissingLanguageColumnError(error)) {
    console.warn(
      '[doctor] ai_conversations.language missing — using metadata.language. Apply migration 20250709000000_conversation_language.sql'
    );
    const { error: retryError } = await supabase
      .from('ai_conversations')
      .update({
        title: payload.title,
        updated_at: payload.updated_at,
        metadata: { ...payload.metadata, language: payload.language },
      })
      .eq('id', conversationId)
      .eq('user_id', userId);
    if (retryError) throw retryError;
    return;
  }

  throw error;
}

async function insertConversationRow(
  supabase: SupabaseClient,
  payload: {
    organization_id: string | null;
    user_id: string;
    title: string;
    language: ConversationLanguage;
    metadata: Record<string, unknown>;
  }
): Promise<string> {
  const { data: created, error } = await supabase
    .from('ai_conversations')
    .insert({
      organization_id: payload.organization_id,
      user_id: payload.user_id,
      title: payload.title,
      language: payload.language,
      metadata: payload.metadata,
    })
    .select('id')
    .single();

  if (!error && created?.id) return created.id;

  if (error && isMissingLanguageColumnError(error)) {
    console.warn(
      '[doctor] ai_conversations.language missing — using metadata.language. Apply migration 20250709000000_conversation_language.sql'
    );
    const { data: retryCreated, error: retryError } = await supabase
      .from('ai_conversations')
      .insert({
        organization_id: payload.organization_id,
        user_id: payload.user_id,
        title: payload.title,
        metadata: { ...payload.metadata, language: payload.language },
      })
      .select('id')
      .single();
    if (retryError) throw retryError;
    if (!retryCreated?.id) throw new Error('Conversation could not be saved');
    return retryCreated.id;
  }

  if (error) throw error;
  throw new Error('Conversation could not be saved');
}

export async function saveDoctorConversation(
  supabase: SupabaseClient,
  params: {
    organizationId: string | null;
    userId: string;
    conversationId?: string;
    question: string;
    diagnosis: DoctorDiagnosis;
    pipeline: Awaited<ReturnType<typeof runIntelligenceEngine>>;
    imagePath?: string | null;
    imageMimeType?: string | null;
    language: ConversationLanguage;
  }
): Promise<{ conversationId: string; analysisId: string; memoryEventId: string }> {
  const now = new Date().toISOString();
  let conversationId = params.conversationId;
  const conversationMetadata = {
    type: 'doctor',
    last_diagnosis: params.diagnosis,
    intent: params.pipeline.intent,
    language: params.language,
  };

  if (conversationId) {
    await updateConversationRow(supabase, conversationId, params.userId, {
      title: params.question.slice(0, 80),
      updated_at: now,
      language: params.language,
      metadata: conversationMetadata,
    });
  } else {
    conversationId = await insertConversationRow(supabase, {
      organization_id: params.organizationId,
      user_id: params.userId,
      title: params.question.slice(0, 80),
      language: params.language,
      metadata: conversationMetadata,
    });
  }

  if (!conversationId) throw new Error('Conversation could not be saved');

  const assistantContent = formatDiagnosisMessage(params.diagnosis);

  const { data: insertedMessages } = await supabase
    .from('ai_messages')
    .insert([
      {
        conversation_id: conversationId,
        organization_id: params.organizationId,
        user_id: params.userId,
        role: 'user',
        content: params.question,
        metadata: params.imagePath ? { image_path: params.imagePath } : {},
      },
      {
        conversation_id: conversationId,
        organization_id: params.organizationId,
        user_id: params.userId,
        role: 'assistant',
        content: assistantContent,
        metadata: {
          diagnosis: params.diagnosis,
          evidence_cards: params.pipeline.evidenceCards,
        },
      },
    ])
    .select('id, role');

  const assistantMessageId =
    insertedMessages?.find((m) => m.role === 'assistant')?.id ?? null;

  const { data: analysis } = await supabase
    .from('ai_analyses')
    .insert({
      conversation_id: conversationId,
      organization_id: params.organizationId,
      user_id: params.userId,
      question: params.question,
      diagnosis: params.diagnosis.diagnosis,
      symptoms: params.diagnosis.symptoms,
      risk_level: params.diagnosis.risk_level,
      treatment: params.diagnosis.treatment,
      prevention: params.diagnosis.prevention,
      notes: params.diagnosis.notes,
      confidence: params.diagnosis.confidence,
      source: params.diagnosis.source,
      raw_gemini: params.pipeline.rawGemini,
      raw_openai: params.pipeline.rawOpenai,
      raw_brain: {
        ...((params.pipeline.rawBrain as object) ?? {}),
        intent: params.pipeline.intent,
        entities: params.pipeline.entities,
        reasoning: params.pipeline.memoryEvent.reasoning_steps,
      },
      knowledge_hits: params.pipeline.knowledgeHits,
      status: 'completed',
      metadata: { intent: params.pipeline.intent },
    })
    .select('id')
    .single();

  if (!analysis?.id) throw new Error('Analysis could not be saved');

  if (params.imagePath && params.imageMimeType) {
    await supabase.from('analysis_images').insert({
      analysis_id: analysis.id,
      user_id: params.userId,
      storage_path: params.imagePath,
      mime_type: params.imageMimeType,
    });
  }

  const intel = await saveIntelligenceData(supabase, {
    conversationId,
    analysisId: analysis.id,
    userId: params.userId,
    organizationId: params.organizationId,
    assistantMessageId,
    intelligence: params.pipeline,
  });

  if (assistantMessageId) {
    await supabase
      .from('ai_messages')
      .update({
        metadata: {
          diagnosis: params.diagnosis,
          evidence_cards: params.pipeline.evidenceCards,
          analysis_id: analysis.id,
          memory_event_id: intel.memoryEventId,
        },
      })
      .eq('id', assistantMessageId);
  }

  await persistDiagnosisMemory(supabase, {
    diagnosisId: analysis.id,
    memoryEventId: intel.memoryEventId,
    userId: params.userId,
    organizationId: params.organizationId,
    crop: params.pipeline.memoryEvent.crop,
    disease: params.pipeline.memoryEvent.disease,
    confidence: params.pipeline.memoryEvent.confidence,
    treatment: params.pipeline.memoryEvent.treatment,
    location: params.pipeline.entities.location,
    season: params.pipeline.entities.season,
  }).catch(() => undefined);

  return {
    conversationId,
    analysisId: analysis.id,
    memoryEventId: intel.memoryEventId,
  };
}

export async function uploadAnalysisImage(
  supabase: SupabaseClient,
  userId: string,
  base64: string,
  mimeType: string
): Promise<string> {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const data = base64.includes(',') ? base64.split(',')[1]! : base64;
  const buffer = Buffer.from(data, 'base64');
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('analysis-images').upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export async function saveImageAttachmentConversation(
  supabase: SupabaseClient,
  params: {
    organizationId: string | null;
    userId: string;
    conversationId?: string;
    imagePath: string;
    language: ConversationLanguage;
  }
): Promise<{ conversationId: string; assistantContent: string }> {
  const now = new Date().toISOString();
  const assistantContent = getImageOnlyPrompt(params.language);
  let conversationId = params.conversationId;
  const conversationMetadata = {
    type: 'doctor',
    pending_image: true,
    language: params.language,
  };

  if (conversationId) {
    await updateConversationRow(supabase, conversationId, params.userId, {
      title: params.language === 'tr' ? 'Fotoğraf yüklendi' : 'Photo uploaded',
      updated_at: now,
      language: params.language,
      metadata: conversationMetadata,
    });
  } else {
    conversationId = await insertConversationRow(supabase, {
      organization_id: params.organizationId,
      user_id: params.userId,
      title: params.language === 'tr' ? 'Fotoğraf yüklendi' : 'Photo uploaded',
      language: params.language,
      metadata: conversationMetadata,
    });
  }

  if (!conversationId) throw new Error('Conversation could not be saved');

  await supabase.from('ai_messages').insert([
    {
      conversation_id: conversationId,
      organization_id: params.organizationId,
      user_id: params.userId,
      role: 'user',
      content: '',
      metadata: { image_path: params.imagePath, image_only: true },
    },
    {
      conversation_id: conversationId,
      organization_id: params.organizationId,
      user_id: params.userId,
      role: 'assistant',
      content: assistantContent,
      metadata: { image_only_prompt: true },
    },
  ]);

  return { conversationId, assistantContent };
}
