import { buildEvidenceCards } from './evidence-cards';
import type { EvidenceCard } from './types-intelligence';
import {
  extractEntities,
  primaryCrop,
  primaryDisease,
  primaryPest,
  type ExtractedEntities,
} from './entity-extractor';
import { classifyIntent, type AgricultureIntent } from './intent-classifier';
import { formatMemoryContextForPrompt } from './memory-context';
import { runKnowledgeBankDoctor } from './knowledge-bank-doctor';
import { resolveDoctorLanguage, normalizeDoctorAnswerLanguage, normalizeEvidenceCardsLanguage } from './language-output-normalizer';
import type { KnowledgeSearchClient } from './knowledge-search';
import type { DoctorAnswer, DoctorPipelineInput, DoctorPipelineOutput } from './types';
import {
  formatVisionSummaryForEvidence,
  parseVisionAnalysis,
  type ParsedVisionAnalysis,
} from './vision-analysis';

export type { AgricultureIntent } from './intent-classifier';
export type { EvidenceCard, EvidenceCardType } from './types-intelligence';
export type { ExtractedEntities } from './entity-extractor';

import type { RankedSimilarCase } from './similar-case-ranking';
import { adjustConfidenceFromOutcomes } from './similar-case-ranking';

export interface IntelligenceContext {
  conversationHistory?: Array<{ role: string; content: string }>;
  similarCases?: RankedSimilarCase[];
  farmMemory?: Array<{ farmName: string; location?: string | null; crops?: string[]; siteType?: string | null }>;
  farmProfile?: import('./farm-profile').FarmIntelligenceProfile | null;
  projectMemory?: Array<{ projectName: string }>;
  diseaseHistory?: Array<{
    crop: string;
    disease: string | null;
    occurrenceCount: number;
    lastOutcome?: string | null;
  }>;
  weather?: {
    location?: string | null;
    temperature?: number | null;
    humidity?: number | null;
    rainfall?: number | null;
    climateZone?: string | null;
  } | null;
  outcomeStats?: { solved: number; improved: number; noChange: number; worse: number; total: number };
}

export interface ReasoningStep {
  step: number;
  name: string;
  detail: string;
}

export interface MemoryEventPayload {
  intent: AgricultureIntent;
  crop: string | null;
  disease: string | null;
  pest: string | null;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  confidence: number;
  provider_used: string;
  raw_gemini_output: unknown;
  final_nertura_answer: Record<string, unknown>;
  entities: ExtractedEntities;
  retrieval_context: Record<string, unknown>;
  reasoning_steps: ReasoningStep[];
  language: 'tr' | 'en';
}

export interface IntelligenceEngineOutput extends DoctorPipelineOutput {
  intent: AgricultureIntent;
  entities: ExtractedEntities;
  evidenceCards: EvidenceCard[];
  memoryEvent: MemoryEventPayload;
  providerUsed: string;
  geminiVisionText: string | null;
}

function buildReasoningSteps(
  intent: AgricultureIntent,
  entities: ExtractedEntities,
  pipeline: DoctorPipelineOutput,
  visionText: string | null
): ReasoningStep[] {
  const topHit = pipeline.knowledgeHits[0];
  return [
    { step: 1, name: 'intent_classification', detail: intent },
    {
      step: 2,
      name: 'entity_extraction',
      detail: JSON.stringify({
        crops: entities.crops,
        diseases: entities.diseases,
        pests: entities.pests,
        symptoms: entities.symptoms,
        urgency: entities.urgency,
        language: entities.language,
      }),
    },
    {
      step: 3,
      name: 'retrieval',
      detail: `${pipeline.knowledgeHits.length} KB hits${topHit ? `; top=${topHit.slug} (${topHit.score})` : ''}`,
    },
    {
      step: 4,
      name: 'provider_research',
      detail: pipeline.answer.source,
    },
    {
      step: 5,
      name: 'brain_synthesis',
      detail: `confidence=${pipeline.answer.confidence}; risk=${pipeline.answer.risk_level}`,
    },
    ...(visionText
      ? [{ step: 6, name: 'image_analysis', detail: visionText.slice(0, 120) }]
      : []),
  ];
}

function extractVisionText(rawGemini: unknown): string | null {
  if (!rawGemini || typeof rawGemini !== 'object') return null;
  const obj = rawGemini as { text?: string };
  if (typeof obj.text === 'string') return obj.text;
  return null;
}

function extractParsedVision(rawBrain: unknown): ParsedVisionAnalysis | null {
  if (!rawBrain || typeof rawBrain !== 'object') return null;
  const vision = (rawBrain as { vision?: unknown }).vision;
  if (!vision || typeof vision !== 'object') return null;
  if ('plantSpecies' in vision && 'confidence' in vision) {
    return vision as ParsedVisionAnalysis;
  }
  return null;
}

function resolveVisionSummary(
  pipeline: DoctorPipelineOutput,
  language: 'tr' | 'en'
): string | null {
  const parsed = extractParsedVision(pipeline.rawBrain);
  if (parsed) return formatVisionSummaryForEvidence(parsed, language);

  const text = extractVisionText(pipeline.rawGemini);
  if (text) return formatVisionSummaryForEvidence(parseVisionAnalysis(text), language);

  return null;
}

export async function runIntelligenceEngine(
  supabase: KnowledgeSearchClient,
  input: DoctorPipelineInput,
  context: IntelligenceContext = {}
): Promise<IntelligenceEngineOutput> {
  const entities = extractEntities(input.question);
  const language = resolveDoctorLanguage({ question: input.question, language: input.language });
  const intent = classifyIntent(input.question, entities);

  const memoryContextBlock = formatMemoryContextForPrompt(context, language);
  const mergedMemoryBlock = [memoryContextBlock, input.memoryContextBlock]
    .filter(Boolean)
    .join('\n\n')
    .trim();

  const pipeline = await runKnowledgeBankDoctor(supabase, {
    ...input,
    language,
    farmProfile: context.farmProfile ?? input.farmProfile,
    conversationHistory: context.conversationHistory ?? input.conversationHistory,
    memoryContextBlock: mergedMemoryBlock || undefined,
  });

  pipeline.answer = normalizeDoctorAnswerLanguage(pipeline.answer, language);

  const topHit = pipeline.knowledgeHits[0];
  const geminiVisionText = resolveVisionSummary(pipeline, language);

  const evidenceCards = normalizeEvidenceCardsLanguage(
    buildEvidenceCards({
      language,
      intent,
      entities,
      knowledgeHits: pipeline.knowledgeHits,
      topHit,
      visionSummary: geminiVisionText,
      similarCases: context.similarCases,
      hasConversationHistory: Boolean(context.conversationHistory?.length),
      farmMemory: context.farmMemory,
      farmProfile: context.farmProfile ?? input.farmProfile,
      projectMemory: context.projectMemory,
      diseaseHistory: context.diseaseHistory,
      weather: context.weather ?? { location: entities.location, climateZone: entities.season },
    }),
    language
  );

  let adjustedConfidence = pipeline.answer.confidence;
  if (context.outcomeStats && context.outcomeStats.total > 0) {
    adjustedConfidence = adjustConfidenceFromOutcomes(
      pipeline.answer.confidence,
      context.outcomeStats
    );
    pipeline.answer.confidence = adjustedConfidence;
  }

  const reasoningSteps = buildReasoningSteps(intent, entities, pipeline, geminiVisionText);

  const memoryEvent: MemoryEventPayload = {
    intent,
    crop: primaryCrop(entities),
    disease: primaryDisease(entities),
    pest: primaryPest(entities),
    symptoms: entities.symptoms,
    diagnosis: pipeline.answer.diagnosis,
    treatment: pipeline.answer.treatment,
    confidence: pipeline.answer.confidence,
    provider_used: pipeline.answer.source,
    raw_gemini_output: pipeline.rawGemini,
    final_nertura_answer: {
      answer: pipeline.answer,
      formatted: pipeline.answer.formatted,
      sections: pipeline.answer.sections,
    },
    entities,
    retrieval_context: {
      knowledgeHits: pipeline.knowledgeHits.slice(0, 5),
      evidenceCards,
      conversationHistoryUsed: Boolean(context.conversationHistory?.length),
      similarCases: context.similarCases ?? [],
    },
    reasoning_steps: reasoningSteps,
    language,
  };

  return {
    ...pipeline,
    intent,
    entities,
    evidenceCards,
    memoryEvent,
    providerUsed: pipeline.answer.source,
    geminiVisionText,
  };
}
