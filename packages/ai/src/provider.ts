import { synthesizeWithBrain } from './brain';
import { analyzeWithGeminiVision } from './gemini';
import { formatKnowledgeContext } from './knowledge-context';
import {
  knowledgeHitToAnswer,
  searchKnowledgeItems,
  type KnowledgeSearchClient,
} from './knowledge-search';
import { analyzeWithOpenAI, buildMockAnswer } from './openai';
import type {
  DoctorAnswer,
  DoctorPipelineInput,
  DoctorPipelineOutput,
  KnowledgeHit,
} from './types';
import { DOCTOR_DISCLAIMER } from './types';

type StructuredAnswer = Omit<DoctorAnswer, 'disclaimer' | 'source'>;

function buildStructuredFallback(
  question: string,
  knowledgeHits: KnowledgeHit[]
): { answer: StructuredAnswer; usedMock: boolean } {
  const topHit = knowledgeHits[0];
  if (topHit && topHit.score >= 0.55) {
    const kb = knowledgeHitToAnswer(topHit, 'tr', question);
    return {
      answer: {
        diagnosis: kb.diagnosis,
        symptoms: kb.symptoms,
        risk_level: kb.risk_level,
        treatment: kb.treatment,
        prevention: kb.prevention,
        notes: kb.notes,
        confidence: kb.confidence,
        matched_slug: kb.matched_slug,
        matched_type: kb.matched_type,
      },
      usedMock: false,
    };
  }

  const mock = buildMockAnswer(question);
  return {
    answer: {
      diagnosis: mock.diagnosis,
      symptoms: mock.symptoms,
      risk_level: mock.risk_level,
      treatment: mock.treatment,
      prevention: mock.prevention,
      notes: mock.notes,
      confidence: mock.confidence,
    },
    usedMock: true,
  };
}

/**
 * Nertura AI Provider — server-side only.
 *
 * Flow:
 * 1. Search knowledge_items for context
 * 2. Gemini Vision if image present
 * 3. OpenAI structures the answer (with KB + vision context)
 * 4. Nertura Brain produces the final response
 * 5. Returns raw Gemini, raw OpenAI, raw Brain + final answer
 */
export async function runNerturaDoctorProvider(
  supabase: KnowledgeSearchClient,
  input: DoctorPipelineInput
): Promise<DoctorPipelineOutput> {
  // Step 1 — knowledge base context
  const knowledgeHits = await searchKnowledgeItems(supabase, input.question);

  // Step 2 — Gemini Vision (if image)
  let rawGemini: unknown = null;
  let geminiVision: string | null = null;
  let usedGemini = false;

  if (input.imageBase64 && input.imageMimeType) {
    const gemini = await analyzeWithGeminiVision(
      input.imageBase64,
      input.imageMimeType,
      input.question
    );
    if (gemini) {
      rawGemini = gemini.raw;
      geminiVision = gemini.text;
      usedGemini = true;
    }
  }

  // Step 3 — OpenAI structured answer
  let rawOpenai: unknown = null;
  let usedOpenAi = false;
  let usedMock = false;

  const openaiResult = await analyzeWithOpenAI({
    question: input.question,
    visionContext: geminiVision,
    knowledgeHits,
    knowledgeContext: formatKnowledgeContext(knowledgeHits),
  });

  let structuredAnswer: StructuredAnswer;

  if (openaiResult) {
    rawOpenai = openaiResult.raw;
    usedOpenAi = true;
    structuredAnswer = openaiResult.answer;
  } else {
    const fallback = buildStructuredFallback(input.question, knowledgeHits);
    structuredAnswer = fallback.answer;
    usedMock = fallback.usedMock;
  }

  // Step 4 — Nertura Brain final synthesis
  const brain = synthesizeWithBrain({
    question: input.question,
    structuredAnswer,
    geminiVision,
    knowledgeHits,
    usedMock,
    usedOpenAi,
    usedGemini,
  });

  const answer: DoctorAnswer = {
    ...brain.answer,
    disclaimer: DOCTOR_DISCLAIMER,
  };

  return {
    answer,
    knowledgeHits,
    rawGemini,
    rawOpenai,
    rawBrain: brain.raw,
  };
}
