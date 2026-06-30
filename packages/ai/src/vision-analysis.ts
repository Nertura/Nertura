import type { CropId } from './crop-lexicon';
import { CROP_ALIASES, detectCropsFromQuery } from './crop-lexicon';
import { buildNerturaSections, sectionsToDoctorAnswer } from './answer-formatter';
import { containsFarmerVisibleEnglish, findEnglishLeaks } from './language-output-normalizer';
import type { QueryLanguage } from './question-analyzer';
import type { DoctorAnswer } from './types';
import { DOCTOR_DISCLAIMER } from './types';

/** Minimum vision confidence before disease diagnosis from photo. */
export const VISION_MIN_CONFIDENCE = 0.52;

export interface ParsedVisionAnalysis {
  plantSpecies: string;
  cropId: CropId | null;
  confidence: number;
  observations: string;
  possibleConditions: string;
  imageQuality: 'good' | 'poor' | 'unclear';
  needsClarification: boolean;
  clarificationQuestions: string[];
  rawText: string;
}

export function resolveCropIdFromLabel(label: string): CropId | null {
  const q = label.toLowerCase().trim();
  if (CROP_ALIASES[q]) return CROP_ALIASES[q]!;
  const detected = detectCropsFromQuery(label);
  return detected[0] ?? null;
}

function clampConfidence(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0.45;
  return Math.max(0, Math.min(1, n));
}

function parseImageQuality(value: unknown): ParsedVisionAnalysis['imageQuality'] {
  const q = String(value ?? '').toLowerCase();
  if (q === 'good' || q === 'poor' || q === 'unclear') return q;
  return 'unclear';
}

/** Parse structured vision JSON or fall back to text heuristics. */
export function parseVisionAnalysis(rawText: string): ParsedVisionAnalysis {
  const trimmed = rawText.trim();

  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      const cropLabel = String(
        parsed.crop_category ?? parsed.cropCategory ?? parsed.plant_species ?? parsed.plantSpecies ?? ''
      );
      const cropId = resolveCropIdFromLabel(cropLabel);
      const confidence = clampConfidence(parsed.confidence);
      const imageQuality = parseImageQuality(parsed.image_quality ?? parsed.imageQuality);
      const needsClarification =
        Boolean(parsed.needs_clarification ?? parsed.needsClarification) ||
        imageQuality !== 'good' ||
        confidence < VISION_MIN_CONFIDENCE;

      const questionsRaw = parsed.clarification_questions ?? parsed.clarificationQuestions;
      const clarificationQuestions = Array.isArray(questionsRaw)
        ? questionsRaw.map(String).filter(Boolean)
        : [];

      return {
        plantSpecies: String(parsed.plant_species ?? parsed.plantSpecies ?? cropLabel ?? 'unknown'),
        cropId,
        confidence,
        observations: String(parsed.visible_symptoms ?? parsed.observations ?? '').trim(),
        possibleConditions: String(
          parsed.possible_conditions ?? parsed.possibleConditions ?? ''
        ).trim(),
        imageQuality,
        needsClarification,
        clarificationQuestions,
        rawText: trimmed,
      };
    }
  } catch {
    // fall through to heuristic parse
  }

  const detected = detectCropsFromQuery(trimmed);
  const cropId = detected[0] ?? null;
  const lowQuality =
    /unclear|blurry|cannot see|can't see|unable to|not visible|belirsiz|net değil/i.test(trimmed);

  return {
    plantSpecies: cropId ?? 'unknown',
    cropId,
    confidence: lowQuality ? 0.35 : cropId ? 0.62 : 0.4,
    observations: trimmed.slice(0, 400),
    possibleConditions: '',
    imageQuality: lowQuality ? 'poor' : 'unclear',
    needsClarification: lowQuality || !cropId,
    clarificationQuestions: [],
    rawText: trimmed,
  };
}

export function cropsConflict(visionCrop: CropId | null, queryCrops: CropId[]): boolean {
  if (!visionCrop || !queryCrops.length) return false;
  return !queryCrops.includes(visionCrop);
}

export function buildClarificationAnswer(params: {
  language: QueryLanguage;
  reason: 'low_confidence' | 'crop_conflict' | 'vision_failed' | 'unclear_image';
  vision?: ParsedVisionAnalysis | null;
  userCrops?: CropId[];
  userQuestion?: string;
}): DoctorAnswer {
  const { language, reason, vision, userCrops = [] } = params;
  const isTr = language === 'tr';

  let diagnosis: string;
  let possibleCauses: string;
  let immediateAction: string;

  if (reason === 'vision_failed') {
    diagnosis = isTr
      ? 'Fotoğraf şu an analiz edilemedi.'
      : 'The photo could not be analyzed right now.';
    possibleCauses = isTr
      ? 'Geçici bir bağlantı sorunu veya desteklenmeyen görüntü olabilir.'
      : 'This may be a temporary connection issue or unsupported image.';
    immediateAction = isTr
      ? 'Lütfen JPG/PNG fotoğrafı tekrar yükleyin veya sorununuzu yazılı anlatın.'
      : 'Please re-upload a JPG/PNG photo or describe the problem in text.';
  } else if (reason === 'crop_conflict' && vision?.cropId && userCrops.length) {
    diagnosis = isTr
      ? 'Metindeki bitki ile fotoğraftaki bitki uyuşmuyor.'
      : 'The crop in your message does not match the plant in the photo.';
    possibleCauses = isTr
      ? `Yazdığınız: ${userCrops.join(', ')}. Fotoğrafta görünen: ${vision.plantSpecies}.`
      : `You mentioned: ${userCrops.join(', ')}. Photo appears to show: ${vision.plantSpecies}.`;
    immediateAction = isTr
      ? 'Hangi bitki için yardım istediğinizi netleştirin ve doğru bitkinin yakın çekim fotoğrafını yükleyin.'
      : 'Clarify which plant you need help with and upload a close-up photo of the correct plant.';
  } else {
    const pct = vision ? Math.round(vision.confidence * 100) : 0;
    diagnosis = isTr
      ? 'Fotoğraftan kesin teşhis için yeterli netlik yok.'
      : 'The photo is not clear enough for a confident diagnosis.';
    possibleCauses =
      vision?.observations ||
      (isTr
        ? `Görüntü kalitesi: ${vision?.imageQuality ?? 'belirsiz'}. Güven: ~%${pct}.`
        : `Image quality: ${vision?.imageQuality ?? 'unclear'}. Confidence: ~${pct}%.`);
    const extra =
      vision?.clarificationQuestions?.[0] ??
      (isTr
        ? 'Yaprak, meyve veya gövdeyi gün ışığında yakından çekin.'
        : 'Take a close photo of leaves, fruit, or stem in daylight.');
    immediateAction = extra;
  }

  const sections = buildNerturaSections({
    language,
    diagnosis,
    possibleCauses,
    riskLevel: 'low',
    immediateAction,
    treatmentPlan: isTr
      ? 'Net fotoğraf gelene kadar kesin ilaç/gübre önerisi vermiyorum.'
      : 'I will not recommend specific chemicals until a clear photo is provided.',
    prevention: isTr
      ? 'Belirtileri not alın; yayılıyorsa etkilenen kısımların fotoğrafını çekin.'
      : 'Note symptoms; if spreading, photograph affected areas.',
    expertWarning: isTr
      ? 'Yanlış bitki teşhisi riskine karşı önce netlik sağlanmalı.'
      : 'Clarity first — misidentifying the plant leads to wrong advice.',
  });

  return sectionsToDoctorAnswer(sections, language, {
    confidence: vision?.confidence ?? 0.25,
    source: 'gemini',
    disclaimer: DOCTOR_DISCLAIMER,
    internalNotes: `vision_clarification:${reason}`,
  });
}

const IMAGE_QUALITY_LABELS: Record<ParsedVisionAnalysis['imageQuality'], { tr: string; en: string }> = {
  good: { tr: 'İyi', en: 'Good' },
  poor: { tr: 'Düşük', en: 'Poor' },
  unclear: { tr: 'Belirsiz', en: 'Unclear' },
};

function sanitizeVisionField(text: string, language: QueryLanguage, fallbackTr: string): string {
  if (language !== 'tr' || !text.trim()) return text.trim();
  if (containsFarmerVisibleEnglish(text)) return fallbackTr;
  return text.trim();
}

function localizeSpeciesLabel(species: string, language: QueryLanguage): string {
  if (language !== 'tr') return species;
  const lower = species.toLowerCase();
  const map: Record<string, string> = {
    unknown: 'Belirsiz',
    cucumber: 'Salatalık',
    tomato: 'Domates',
    olive: 'Zeytin',
    'olive-tree': 'Zeytin',
  };
  return map[lower] ?? species;
}

/** Human-readable vision summary for evidence cards — never [object Object]. */
export function formatVisionSummaryForEvidence(
  input: string | ParsedVisionAnalysis | null | undefined,
  language: QueryLanguage
): string | null {
  if (input == null) return null;

  const parsed: ParsedVisionAnalysis =
    typeof input === 'string' ? parseVisionAnalysis(input) : input;

  const isTr = language === 'tr';
  const quality = IMAGE_QUALITY_LABELS[parsed.imageQuality][language];
  const confidencePct = Math.round(parsed.confidence * 100);
  const species = localizeSpeciesLabel(
    parsed.plantSpecies || parsed.cropId || (isTr ? 'Belirsiz' : 'Unknown'),
    language
  );

  const lines = [
    `${isTr ? 'Bitki' : 'Plant'}: ${species}`,
    `${isTr ? 'Görüntü kalitesi' : 'Image Quality'}: ${quality}`,
  ];

  if (parsed.observations?.trim()) {
    const obs = sanitizeVisionField(
      parsed.observations,
      language,
      'Fotoğrafta belirtiler değerlendirildi; yakın çekim daha net sonuç verir.'
    );
    lines.push(`${isTr ? 'Gözlemlenen belirtiler' : 'Detected Symptoms'}: ${obs}`);
  }

  if (parsed.possibleConditions?.trim()) {
    const cond = sanitizeVisionField(
      parsed.possibleConditions,
      language,
      'Kesin teşhis için daha net bir fotoğraf gerekebilir.'
    );
    lines.push(`${isTr ? 'Olası durumlar' : 'Possible Conditions'}: ${cond}`);
  }

  lines.push(`${isTr ? 'Güven' : 'Confidence'}: ${confidencePct}%`);

  if (parsed.cropId && parsed.cropId !== parsed.plantSpecies) {
    lines.push(`${isTr ? 'Tür' : 'Species'}: ${parsed.cropId}`);
  }

  return lines.join('\n').slice(0, 400);
}
