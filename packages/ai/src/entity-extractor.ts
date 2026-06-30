import { detectCropsFromQuery, type CropId } from './crop-lexicon';
import { analyzeQuestion, type QuestionAnalysis, type QueryLanguage } from './question-analyzer';
import type { UrgencyLevel } from './types-intelligence';

export interface ExtractedEntities extends QuestionAnalysis {
  pests: string[];
  urgency: UrgencyLevel;
  season: string | null;
}

const PEST_HINTS: Record<string, string[]> = {
  aphid: ['yaprak biti', 'aphid', 'bit'],
  thrips: ['trips', 'thrips'],
  mite: ['akari', 'mite', 'kırmızı örümcek', 'kirmizi orumcek'],
  'olive-fly': ['zeytin sineği', 'zeytin sinegi', 'olive fly'],
  'tomato-hornworm': ['tırtıl', 'tirtil', 'hornworm'],
};

const URGENCY_CRITICAL = /acil|hemen|critical|dying|ölüyor|oluyor|spread|yayılıyor|yayiliyor|tüm|tum/i;
const URGENCY_HIGH = /hızlı|hizli|fast|worsening|kötüleş|kotules|urgent|çok|cok/i;

const SEASON_HINTS: Array<{ season: string; pattern: RegExp }> = [
  { season: 'spring', pattern: /ilkbahar|spring|nisan|mayıs|mayis|mart/i },
  { season: 'summer', pattern: /yaz|summer|haziran|temmuz|ağustos|agustos/i },
  { season: 'autumn', pattern: /sonbahar|autumn|fall|eylül|eylul|ekim|kasım|kasim/i },
  { season: 'winter', pattern: /kış|kis|winter|aralık|aralik|ocak|şubat|subat/i },
];

const LOCATION_HINTS =
  /\b(istanbul|ankara|izmir|antalya|adana|bursa|aegean|mediterranean|ege|akdeniz|karadeniz|anadolu|sera|greenhouse|tarla|field|bahçe|bahce|garden)\b/i;

function detectPests(query: string): string[] {
  const q = query.toLowerCase();
  const found: string[] = [];
  for (const [slug, hints] of Object.entries(PEST_HINTS)) {
    if (hints.some((h) => q.includes(h))) found.push(slug);
  }
  return found;
}

function detectUrgency(query: string): UrgencyLevel {
  if (URGENCY_CRITICAL.test(query)) return 'critical';
  if (URGENCY_HIGH.test(query)) return 'high';
  if (/izle|monitor|watch|yavaş|yavas/i.test(query)) return 'low';
  return 'medium';
}

function detectSeason(query: string): string | null {
  for (const { season, pattern } of SEASON_HINTS) {
    if (pattern.test(query)) return season;
  }
  return null;
}

function detectLocation(query: string): string | null {
  const match = query.match(LOCATION_HINTS);
  return match ? match[0] : null;
}

export function extractEntities(question: string): ExtractedEntities {
  const base = analyzeQuestion(question);
  return {
    ...base,
    location: base.location ?? detectLocation(question),
    pests: detectPests(question),
    urgency: detectUrgency(question),
    season: detectSeason(question),
  };
}

export function primaryCrop(entities: ExtractedEntities): CropId | null {
  return entities.crops[0] ?? null;
}

export function primaryDisease(entities: ExtractedEntities): string | null {
  return entities.diseases[0] ?? null;
}

export function primaryPest(entities: ExtractedEntities): string | null {
  return entities.pests[0] ?? null;
}
