import type { DoctorAnswer, KnowledgeHit } from './types';

type StructuredAnswer = Omit<DoctorAnswer, 'disclaimer' | 'source'>;

/** Nertura Brain — final synthesis from OpenAI/mock structure + KB + Gemini context. */
export function synthesizeWithBrain(params: {
  question: string;
  structuredAnswer: StructuredAnswer;
  geminiVision?: string | null;
  knowledgeHits: KnowledgeHit[];
  usedMock: boolean;
  usedOpenAi: boolean;
  usedGemini: boolean;
}): { answer: Omit<DoctorAnswer, 'disclaimer'>; raw: Record<string, unknown> } {
  const topHit = params.knowledgeHits[0];
  const base = params.structuredAnswer;

  const diagnosis = base.diagnosis;
  const symptoms = base.symptoms;
  const risk_level = base.risk_level;
  const treatment = base.treatment;
  const prevention = base.prevention;

  const notes = [
    base.notes,
    params.geminiVision ? `Vision: ${params.geminiVision.slice(0, 300)}` : null,
    topHit ? `Knowledge: ${topHit.type}/${topHit.slug} (score ${topHit.score.toFixed(2)})` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const confidence = Math.min(
    0.98,
    Math.max(
      base.confidence ?? 0,
      topHit?.score ?? 0,
      params.usedGemini ? 0.55 : 0,
      params.usedOpenAi ? 0.6 : 0
    ) || 0.5
  );

  const source: DoctorAnswer['source'] = params.usedMock
    ? 'mock'
    : params.usedOpenAi
      ? 'brain'
      : params.usedGemini
        ? 'brain'
        : topHit
          ? 'brain'
          : 'mock';

  return {
    answer: {
      diagnosis,
      symptoms,
      risk_level,
      treatment,
      prevention,
      notes: notes || 'Nertura Brain synthesis.',
      confidence,
      source,
      matched_slug: topHit?.slug ?? base.matched_slug,
      matched_type: topHit?.type ?? base.matched_type,
    },
    raw: {
      engine: 'nertura-brain-v1',
      question: params.question,
      hit_count: params.knowledgeHits.length,
      has_vision: Boolean(params.geminiVision),
      used_mock: params.usedMock,
      used_openai: params.usedOpenAi,
      used_gemini: params.usedGemini,
      final_answer: {
        diagnosis,
        symptoms,
        risk_level,
        treatment,
        prevention,
        notes,
        confidence,
      },
    },
  };
}
