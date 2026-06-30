import { synthesizeWithBrain } from './brain';
import { runNerturaDoctorProvider } from './provider';
import {
  knowledgeHitToAnswer,
  searchKnowledgeItems,
  type KnowledgeSearchClient,
} from './knowledge-search';
import { analyzeWithGeminiVision } from './gemini';
import { analyzeWithOpenAI, buildMockAnswer } from './openai';
import type { DoctorAnswer, DoctorPipelineInput, DoctorPipelineOutput } from './types';
import { DOCTOR_DISCLAIMER } from './types';

export * from './types';
export * from './env';
export * from './provider';
export * from './knowledge-search';
export * from './knowledge-context';
export * from './vision-analysis';
export * from './memory-context';
export * from './knowledge-bank-doctor';
export * from './question-analyzer';
export * from './answer-formatter';
export type { GeminiTextResult, GeminiDoctorResult, GeminiDoctorDiagnosis } from './gemini';
export {
  askGemini,
  askGeminiAgricultureDoctor,
  isGeminiConfigured,
  getGeminiKeyStatus,
  listGeminiModels,
  GeminiError,
  getGeminiModel,
  analyzeWithGeminiVision,
} from './gemini';
export * from './openai';
export * from './brain';
export * from './intent-classifier';
export * from './entity-extractor';
export * from './evidence-cards';
export * from './similar-case-ranking';
export * from './intelligence-engine';
export * from './farm-profile';
export * from './conversation-language';
export * from './language-output-normalizer';
export * from './farm-intake-parser';
export * from './content-engine';
export type { EvidenceCard, EvidenceCardType, FeedbackType, UrgencyLevel } from './types-intelligence';
export { FEEDBACK_TYPE_VALUES } from './types-intelligence';

export type DoctorDiagnosis = {
  diagnosis: string;
  symptoms: string;
  risk_level: DoctorAnswer['risk_level'];
  treatment: string;
  prevention: string;
  notes: string;
  confidence: number;
  source: DoctorAnswer['source'];
  disclaimer: string;
  matched_slug?: string;
  matched_type?: string;
  language?: 'tr' | 'en';
  formatted?: string;
  sections?: DoctorAnswer['sections'];
};

export function answerToDiagnosis(answer: DoctorAnswer): DoctorDiagnosis {
  return {
    diagnosis: answer.diagnosis,
    symptoms: answer.symptoms,
    risk_level: answer.risk_level,
    treatment: answer.treatment,
    prevention: answer.prevention,
    notes: answer.notes,
    confidence: answer.confidence,
    source: answer.source,
    disclaimer: answer.disclaimer,
    matched_slug: answer.matched_slug,
    matched_type: answer.matched_type,
    language: answer.language,
    formatted: answer.formatted,
    sections: answer.sections,
  };
}

/** @deprecated Use runNerturaDoctorProvider */
export async function runDoctorPipeline(
  supabase: KnowledgeSearchClient,
  input: DoctorPipelineInput
): Promise<DoctorPipelineOutput> {
  return runNerturaDoctorProvider(supabase, input);
}
