import {

  askGeminiAgricultureDoctor,

  analyzeWithGeminiVision,

  GeminiError,

  isGeminiConfigured,

} from './gemini';

import { buildNerturaSections, sectionsToDoctorAnswer } from './answer-formatter';

import { formatKnowledgeContext } from './knowledge-context';

import {

  knowledgeHitToAnswer,

  searchKnowledgeItems,

  detectCropsFromQuery,

  type KnowledgeSearchClient,

} from './knowledge-search';

import { analyzeQuestion, resolvePreferredKbSlugs } from './question-analyzer';

import type { CropId } from './crop-lexicon';

import { formatFarmProfileForPrompt, mergeCropsForDoctor } from './farm-profile';

import {
  buildClarificationAnswer,
  cropsConflict,
  parseVisionAnalysis,
  VISION_MIN_CONFIDENCE,
  type ParsedVisionAnalysis,
} from './vision-analysis';

import {
  detectMessageLanguage,
  hasKbContentInLanguage,
} from './conversation-language';
import {
  buildTurkishKbDiagnosis,
  canServeKbDirectly,
  disclaimerForLanguage,
  normalizeDoctorAnswerLanguage,
  pickLocalizedKbName,
  pickLocalizedKbSummary,
  resolveDoctorLanguage,
} from './language-output-normalizer';

import type { DoctorAnswer, DoctorPipelineInput, DoctorPipelineOutput, KnowledgeHit } from './types';

import { DOCTOR_DISCLAIMER } from './types';



/** Score at or above this → answer directly from Nertura Knowledge Bank. */

export const KB_HIGH_CONFIDENCE_THRESHOLD = 0.78;



const VISION_UNAVAILABLE_NOTE =
  'Photo analysis unavailable — please retry with a clear daylight close-up.';



function pickBestKbHit(
  hits: KnowledgeHit[],
  queryCrops: CropId[],
  preferredSlugs: string[] = []
): KnowledgeHit | undefined {

  if (!hits.length) return undefined;

  for (const slug of preferredSlugs) {
    const match = hits.find(
      (h) => h.slug === slug || h.slug.includes(slug) || slug.includes(h.slug)
    );
    if (match && (!queryCrops.length || queryCrops.some((c) => match.slug.includes(c)))) {
      return match;
    }
  }

  if (!queryCrops.length) return hits[0];

  const cropHit = hits.find((h) =>

    queryCrops.some((c) => h.slug.includes(c) || h.name_en.toLowerCase().includes(c))

  );

  return cropHit ?? hits[0];

}



function hitMatchesQueryCrop(hit: KnowledgeHit, queryCrops: CropId[]): boolean {

  if (!queryCrops.length) return true;

  return queryCrops.some((c) => hit.slug.includes(c) || hit.name_en.toLowerCase().includes(c));

}



function finalizeAnswer(partial: DoctorAnswer, language: 'tr' | 'en'): DoctorAnswer {
  return normalizeDoctorAnswerLanguage(
    { ...partial, disclaimer: disclaimerForLanguage(language), language },
    language
  );
}



function buildFallbackAnswer(
  question: string,
  topHit: KnowledgeHit | undefined,
  geminiVision: string | null,
  imagePending: boolean,
  language: 'tr' | 'en'
): DoctorAnswer {
  if (topHit && canServeKbDirectly(topHit, language)) {
    try {
      const kb = knowledgeHitToAnswer(topHit, language, question);
      const visionNote = geminiVision ? `Vision: ${geminiVision.slice(0, 280)}` : null;
      return finalizeAnswer(
        {
          ...kb,
          confidence: Math.min(0.72, topHit.score),
          source: 'fallback',
          notes: [
            kb.notes,
            visionNote,
            imagePending ? VISION_UNAVAILABLE_NOTE : null,
            language === 'tr'
              ? 'Yedek mod — Bilgi bankasından yanıt.'
              : 'Fallback mode — answer from Knowledge Bank.',
          ]
            .filter(Boolean)
            .join(' | '),
        },
        language
      );
    } catch {
      // fall through
    }
  }

  const sections = buildNerturaSections({
    language,
    diagnosis:
      language === 'tr'
        ? 'Genel tarım rehberliği (güvenli yedek yanıt)'
        : 'General agricultural guidance (safe fallback)',
    possibleCauses:
      language === 'tr'
        ? 'Bilgi bankasında spesifik eşleşme bulunamadı.'
        : 'No specific match found in knowledge bank.',
    riskLevel: 'medium',
    immediateAction:
      language === 'tr'
        ? 'Bitkileri yakından izleyin; dengeli sulama ve besleme sağlayın.'
        : 'Monitor plants; ensure balanced irrigation and nutrition.',
    treatmentPlan:
      language === 'tr'
        ? 'Yerel ziraat mühendisine danışın; tarla kayıtlarınızı hazırlayın.'
        : 'Consult a local agronomist; prepare your field records.',
    prevention:
      language === 'tr'
        ? 'Rotasyon, dayanıklı çeşit ve düzenli gözlem uygulayın.'
        : 'Use rotation, resistant varieties, and regular scouting.',
  });

  return finalizeAnswer(
    sectionsToDoctorAnswer(sections, language, {
      confidence: 0.4,
      source: 'fallback',
      disclaimer: '',
      internalNotes: [
        `Question: "${question.slice(0, 200)}"`,
        geminiVision ? `Vision: ${geminiVision.slice(0, 280)}` : null,
        imagePending ? VISION_UNAVAILABLE_NOTE : null,
        language === 'tr' ? 'Gemini meşgul — lütfen tekrar deneyin.' : 'Gemini busy — please retry.',
      ]
        .filter(Boolean)
        .join(' | '),
    }),
    language
  );
}

function combineKbAndGemini(

  hit: KnowledgeHit | undefined,

  gemini: {

    diagnosis: string;

    symptoms: string;

    risk_level: DoctorAnswer['risk_level'];

    treatment: string;

    prevention: string;

    notes: string;

    immediate_action?: string;

    possible_causes?: string;

    expert_warning?: string;

  },

  language: 'tr' | 'en'

): DoctorAnswer {

  const kbPartial =
    hit && canServeKbDirectly(hit, language)
      ? (() => {
          try {
            return knowledgeHitToAnswer(hit, language, '');
          } catch {
            return null;
          }
        })()
      : null;



  const sections = buildNerturaSections({

    language,

    diagnosis: gemini.diagnosis || kbPartial?.diagnosis || '',

    possibleCauses: gemini.possible_causes || gemini.symptoms || kbPartial?.symptoms || '',

    riskLevel: gemini.risk_level ?? kbPartial?.risk_level ?? 'medium',

    immediateAction:

      gemini.immediate_action ||

      (language === 'tr' ? 'Belirtileri kaydedin ve 3–5 gün içinde tekrar değerlendirin.' : 'Record symptoms and reassess in 3–5 days.'),

    treatmentPlan: gemini.treatment || kbPartial?.treatment || '',

    prevention: gemini.prevention || kbPartial?.prevention || '',

    expertWarning: gemini.expert_warning || gemini.notes,

    topHit: hit,

  });



  return sectionsToDoctorAnswer(sections, language, {

    confidence: hit ? Math.min(0.95, Math.max(hit.score, 0.72)) : 0.75,

    source: hit ? 'brain' : 'gemini',

    matched_slug: hit?.slug,

    matched_type: hit?.type,

    disclaimer: DOCTOR_DISCLAIMER,

    internalNotes: hit

      ? `Nertura Brain: KB ${hit.type}/${hit.slug} + Gemini synthesis`

      : 'Nertura Brain: Gemini synthesis',

  });

}



/**

 * Nertura Knowledge Bank doctor flow:

 * 1. Analyze question (language, crop, symptoms)

 * 2. Search knowledge_items

 * 3. High confidence + crop match → KB answer

 * 4. Else → Gemini with KB context → Nertura Brain synthesis

 * 5. On failure → safe fallback

 */

export async function runKnowledgeBankDoctor(

  supabase: KnowledgeSearchClient,

  input: DoctorPipelineInput

): Promise<DoctorPipelineOutput> {

  const question = input.question.trim();

  const hasImage = Boolean(input.imageBase64 && input.imageMimeType);

  const analysis = analyzeQuestion(question);

  const language = resolveDoctorLanguage({ question, language: input.language });

  let rawGemini: unknown = null;

  let geminiVision: string | null = null;

  let imagePending = false;

  let parsedVision: ParsedVisionAnalysis | null = null;

  const detectedEarly = analysis.crops.length ? analysis.crops : detectCropsFromQuery(question);

  const preliminaryCrops = mergeCropsForDoctor(
    input.farmProfile?.crops ?? [],
    detectedEarly
  ) as CropId[];

  /** Vision runs BEFORE knowledge retrieval when a photo is present. */
  if (hasImage) {

    const vision = await analyzeWithGeminiVision(

      input.imageBase64!,

      input.imageMimeType!,

      question

    );

    if (!vision) {

      imagePending = true;

      const clarify = buildClarificationAnswer({ language, reason: 'vision_failed' });

      return {

        answer: finalizeAnswer(clarify, language),

        knowledgeHits: [],

        rawGemini: null,

        rawOpenai: null,

        rawBrain: { mode: 'vision_failed', language },

      };

    }

    rawGemini = vision.raw;

    geminiVision = vision.text;

    parsedVision = parseVisionAnalysis(vision.text);

    if (parsedVision.needsClarification || parsedVision.confidence < VISION_MIN_CONFIDENCE) {

      const clarify = buildClarificationAnswer({

        language,

        reason: 'low_confidence',

        vision: parsedVision,

        userCrops: preliminaryCrops,

      });

      return {

        answer: finalizeAnswer(clarify, language),

        knowledgeHits: [],

        rawGemini,

        rawOpenai: null,

        rawBrain: { mode: 'vision_clarification', language, vision: parsedVision },

      };

    }

    if (cropsConflict(parsedVision.cropId, preliminaryCrops)) {

      const clarify = buildClarificationAnswer({

        language,

        reason: 'crop_conflict',

        vision: parsedVision,

        userCrops: preliminaryCrops,

      });

      return {

        answer: finalizeAnswer(clarify, language),

        knowledgeHits: [],

        rawGemini,

        rawOpenai: null,

        rawBrain: { mode: 'crop_conflict', language, vision: parsedVision },

      };

    }

  }

  let queryCrops = preliminaryCrops;

  if (parsedVision?.cropId && !queryCrops.includes(parsedVision.cropId)) {

    queryCrops = [...queryCrops, parsedVision.cropId];

  }

  const preferredSlugs = resolvePreferredKbSlugs(queryCrops, analysis.diseases);

  const knowledgeHits = await searchKnowledgeItems(supabase, question);

  const topHit = pickBestKbHit(knowledgeHits, queryCrops, preferredSlugs);

  const visionAgreesWithKb = (hit: KnowledgeHit): boolean => {

    if (!parsedVision?.cropId) return true;

    const slug = hit.slug.toLowerCase();

    const name = hit.name_en.toLowerCase();

    return slug.includes(parsedVision.cropId) || name.includes(parsedVision.cropId);

  };

  console.info('[knowledge-bank-doctor] analyze', {

    language,

    queryCrops,

    diseases: analysis.diseases,

    symptoms: analysis.symptoms,

    hits: knowledgeHits.length,

    topScore: topHit?.score ?? 0,

    topSlug: topHit?.slug,

    hasImage,

    visionCrop: parsedVision?.cropId,

    visionConfidence: parsedVision?.confidence,

  });

  const canUseKbDirect =

    topHit &&

    topHit.score >= KB_HIGH_CONFIDENCE_THRESHOLD &&

    hitMatchesQueryCrop(topHit, queryCrops) &&

    (!hasImage ||

      (parsedVision != null &&

        parsedVision.confidence >= VISION_MIN_CONFIDENCE &&

        visionAgreesWithKb(topHit)));

  if (canUseKbDirect && topHit && canServeKbDirectly(topHit, language) && hasKbContentInLanguage(topHit, language)) {

    const kb = finalizeAnswer(knowledgeHitToAnswer(topHit, language, question), language);

    if (geminiVision || imagePending) {

      kb.notes = [kb.notes, geminiVision ? `Vision: ${geminiVision.slice(0, 280)}` : null, imagePending ? VISION_UNAVAILABLE_NOTE : null]

        .filter(Boolean)

        .join(' | ');

    }



    console.info('[knowledge-bank-doctor] high-confidence KB answer', {

      slug: topHit.slug,

      score: topHit.score,

      language,

    });



    return {

      answer: kb,

      knowledgeHits,

      rawGemini,

      rawOpenai: null,

      rawBrain: { mode: 'knowledge_base', score: topHit.score, language, analysis },

    };

  }



  if (!isGeminiConfigured()) {

    return {

      answer: buildFallbackAnswer(question, topHit, geminiVision, imagePending, language),

      knowledgeHits,

      rawGemini,

      rawOpenai: null,

      rawBrain: { mode: 'fallback_no_gemini', score: topHit?.score ?? 0, language },

    };

  }



  const kbContext = formatKnowledgeContext(knowledgeHits);

  const visionBlock = parsedVision

    ? `\n\nPlant photo analysis (species first):\nSpecies: ${parsedVision.plantSpecies} (confidence ${Math.round(parsedVision.confidence * 100)}%)\nObservations: ${parsedVision.observations}${parsedVision.possibleConditions ? `\nPossible conditions: ${parsedVision.possibleConditions}` : ''}`

    : geminiVision

      ? `\n\nPlant photo analysis:\n${geminiVision}`

      : '';

  const kbBlock = kbContext

    ? `\n\n--- Nertura Knowledge Bank (reference — combine with your answer) ---\n${kbContext}`

    : '';



  const geminiQuestion = `${question}${visionBlock}${kbBlock}`;



  try {

    const farmBlock = formatFarmProfileForPrompt(input.farmProfile, language);

    const memoryBlock = input.memoryContextBlock ?? '';

    const gemini = await askGeminiAgricultureDoctor(

      geminiQuestion,

      queryCrops,

      language,

      farmBlock,

      memoryBlock

    );

    rawGemini = rawGemini ?? gemini.raw;



    const answer = finalizeAnswer(combineKbAndGemini(topHit, gemini.diagnosis, language), language);



    console.info('[knowledge-bank-doctor] combined KB + Gemini', {

      kbSlug: topHit?.slug,

      kbScore: topHit?.score ?? 0,

      model: gemini.model,

      language,

    });



    return {

      answer,

      knowledgeHits,

      rawGemini,

      rawOpenai: null,

      rawBrain: {

        mode: topHit ? 'combined_kb_gemini' : 'gemini_only',

        model: gemini.model,

        kbScore: topHit?.score ?? 0,

        language,

        analysis,

      },

    };

  } catch (err) {

    const message = err instanceof GeminiError ? err.message : String(err);

    console.error('[knowledge-bank-doctor] gemini failed, using fallback', {

      message,

      status: err instanceof GeminiError ? err.status : undefined,

    });



    return {

      answer: buildFallbackAnswer(question, topHit, geminiVision, imagePending, language),

      knowledgeHits,

      rawGemini: { error: message, status: err instanceof GeminiError ? err.status : null },

      rawOpenai: null,

      rawBrain: { mode: 'fallback_gemini_error', kbScore: topHit?.score ?? 0, language },

    };

  }

}


