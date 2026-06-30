import { detectCropsFromQuery, type CropId } from './crop-lexicon';
import { extractEntities, type ExtractedEntities } from './entity-extractor';
import type { UrgencyLevel } from './types-intelligence';

export type FarmAreaUnit = 'donum' | 'hectare' | 'acre' | 'm2';

export interface FarmIntakeLocation {
  country: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  /** Combined search string for geocoding */
  searchLabel: string | null;
}

export interface FarmIntakeParseResult {
  rawText: string;
  location: FarmIntakeLocation;
  crop: CropId | null;
  cropLabel: string | null;
  statedArea: number | null;
  areaUnit: FarmAreaUnit | null;
  symptom: string | null;
  problem: string | null;
  urgency: UrgencyLevel;
  missingFields: string[];
  confidence: 'high' | 'medium' | 'low';
  entities: ExtractedEntities;
}

const TURKEY_MARKERS = /\b(türkiye|turkiye|turkey|tr)\b/i;
const DONUM = /(\d+(?:[.,]\d+)?)\s*(?:dönüm|donum|dekar|daa)\b/i;
const HECTARE = /(\d+(?:[.,]\d+)?)\s*(?:hektar|hectare|ha)\b/i;
const ACRE = /(\d+(?:[.,]\d+)?)\s*(?:acre|acres)\b/i;
const M2 = /(\d+(?:[.,]\d+)?)\s*(?:m²|m2|metrekare)\b/i;

const SYMPTOM_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /sarar(?:ıyor|iyor|mak|ma)/i, label: 'yellowing' },
  { pattern: /kurur|kuruyor|wilt/i, label: 'wilting' },
  { pattern: /leke|spot|necrot/i, label: 'leaf spots' },
  { pattern: /küf|kuf|mildew|fung/i, label: 'fungal signs' },
  { pattern: /böcek|bocek|pest|zararlı|zararli/i, label: 'pest damage' },
  { pattern: /çürü|curu|rot/i, label: 'rot' },
  { pattern: /dökül|dokul|drop/i, label: 'leaf drop' },
];

/** Turkish place pattern: "Osmaniye Toprakkale'de" or "İzmir'de" */
const PLACE_DE =
  /([A-Za-zÇĞİÖŞÜçğıöşü]+(?:\s+[A-Za-zÇĞİÖŞÜçğıöşü]+)?)\s*(?:'de|'da|de|da)\b/i;

const TURKISH_CITIES = [
  'osmaniye',
  'adana',
  'hatay',
  'gaziantep',
  'mersin',
  'antalya',
  'konya',
  'ankara',
  'istanbul',
  'izmir',
  'bursa',
  'samsun',
  'trabzon',
  'diyarbakır',
  'diyarbakir',
  'şanlıurfa',
  'sanliurfa',
];

function parseNumber(raw: string): number {
  return Number(raw.replace(',', '.'));
}

function detectArea(text: string): { value: number; unit: FarmAreaUnit } | null {
  const donum = text.match(DONUM);
  if (donum) return { value: parseNumber(donum[1]!), unit: 'donum' };
  const ha = text.match(HECTARE);
  if (ha) return { value: parseNumber(ha[1]!), unit: 'hectare' };
  const acre = text.match(ACRE);
  if (acre) return { value: parseNumber(acre[1]!), unit: 'acre' };
  const m2 = text.match(M2);
  if (m2) return { value: parseNumber(m2[1]!), unit: 'm2' };
  return null;
}

function detectSymptom(text: string): string | null {
  for (const { pattern, label } of SYMPTOM_PATTERNS) {
    if (pattern.test(text)) return label;
  }
  if (/hastalık|hastalik|disease|problem|sorun/i.test(text)) return 'unspecified problem';
  return null;
}

function detectLocation(text: string): FarmIntakeLocation {
  const lower = text.toLowerCase();
  const country = TURKEY_MARKERS.test(text) ? 'Turkey' : null;

  let city: string | null = null;
  let district: string | null = null;
  let neighborhood: string | null = null;

  for (const c of TURKISH_CITIES) {
    if (lower.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  const deMatch = text.match(PLACE_DE);
  if (deMatch) {
    const place = deMatch[1]!.trim();
    const placeLower = place.toLowerCase();
    if (city && placeLower !== city.toLowerCase()) {
      district = place;
    } else if (!city) {
      city = place;
    } else {
      district = place;
    }
  }

  const parts = [district, city, country ?? 'Turkey'].filter(Boolean);
  const searchLabel = parts.length ? parts.join(', ') : null;

  return { country: country ?? (searchLabel ? 'Turkey' : null), city, district, neighborhood, searchLabel };
}

function cropLabel(id: CropId | null): string | null {
  if (!id) return null;
  const labels: Partial<Record<CropId, string>> = {
    wheat: 'Wheat / Buğday',
    olive: 'Olive / Zeytin',
    tomato: 'Tomato / Domates',
    corn: 'Corn / Mısır',
  };
  return labels[id] ?? id;
}

/**
 * Parse natural-language farm problem intake (TR/EN).
 * Example: "Osmaniye Toprakkale'de 10 dönüm buğday tarlam var, buğday sararıyor."
 */
export function parseFarmIntake(rawText: string): FarmIntakeParseResult {
  const text = rawText.trim();
  const entities = extractEntities(text);
  const crops = detectCropsFromQuery(text);
  const crop = crops[0] ?? entities.crops[0] ?? null;
  const area = detectArea(text);
  const location = detectLocation(text);
  const symptom = detectSymptom(text);

  const missingFields: string[] = [];
  if (!location.searchLabel) missingFields.push('location');
  if (!crop) missingFields.push('crop');
  if (!area) missingFields.push('area');
  if (!symptom) missingFields.push('symptom');

  const confidence: FarmIntakeParseResult['confidence'] =
    missingFields.length === 0 ? 'high' : missingFields.length <= 2 ? 'medium' : 'low';

  return {
    rawText: text,
    location,
    crop,
    cropLabel: cropLabel(crop),
    statedArea: area?.value ?? null,
    areaUnit: area?.unit ?? null,
    symptom,
    problem: symptom ?? entities.diseases[0] ?? entities.symptoms[0] ?? null,
    urgency: entities.urgency,
    missingFields,
    confidence,
    entities,
  };
}

/** Convert stated area to m² for comparison with drawn polygon. */
export function statedAreaToM2(value: number, unit: FarmAreaUnit): number {
  switch (unit) {
    case 'donum':
      return value * 1000;
    case 'hectare':
      return value * 10_000;
    case 'acre':
      return value * 4046.86;
    case 'm2':
      return value;
    default:
      return value;
  }
}

export function formatAreaTriple(areaM2: number): { m2: number; donum: number; hectare: number } {
  return {
    m2: Math.round(areaM2 * 100) / 100,
    donum: Math.round((areaM2 / 1000) * 100) / 100,
    hectare: Math.round((areaM2 / 10_000) * 10000) / 10000,
  };
}

export function areaMismatchRatio(statedM2: number, drawnM2: number): number {
  if (statedM2 <= 0 || drawnM2 <= 0) return 0;
  return Math.abs(statedM2 - drawnM2) / Math.max(statedM2, drawnM2);
}
