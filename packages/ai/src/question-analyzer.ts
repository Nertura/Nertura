import { detectCropsFromQuery, type CropId } from './crop-lexicon';

export type QueryLanguage = 'tr' | 'en';

const TR_HINTS =
  /\b(zeytin|domates|limon|üzüm|uzum|buğday|bugday|biber|salatalık|salatalik|misir|mısır|elma|ağac|agac|yaprak|hastalık|hastalik|gübre|sulama|ne yapmal|teşhis|teshis|var mı|var mi|nasıl|neden|sarar|dökül|dokul|kıvrıl|kivril|külleme|mildiyö|zararlı|çiftçi|tarla|sera|yetiş|yetis|yetiştir|yetistir|ankara|balkon|dikim|ekim|leke|solma)\b/i;

const DISEASE_HINTS: Record<string, string[]> = {
  'powdery-mildew': ['külleme', 'kulleme', 'powdery', 'mildew', 'beyaz toz', 'unlu'],
  'late-blight': ['mildiyö', 'mildiyo', 'late blight', 'phytophthora'],
  'leaf-drop': ['yaprak dök', 'yaprak dok', 'leaf drop', 'defoliation', 'dökülme', 'dokulme', 'dokulmesi'],
  'leaf-curl': ['kıvrıl', 'kivril', 'curl', 'kıvrık', 'kivrik', 'kivriliyor'],
  'yellow-leaves': ['sarar', 'yellow', 'sarı', 'sari', 'sarariyor', 'clorosis', 'kloroz'],
};

/** Map analysis hints → preferred knowledge_items slugs (crop-specific first) */
export function resolvePreferredKbSlugs(crops: CropId[], diseases: string[]): string[] {
  const slugs: string[] = [];
  for (const crop of crops) {
    for (const disease of diseases) {
      if (disease === 'powdery-mildew' && crop === 'grape') {
        slugs.push('grape-powdery-mildew');
      } else if (disease === 'leaf-drop' && crop === 'olive') {
        slugs.push('olive-leaf-drop');
      } else if (disease === 'leaf-curl' && (crop === 'lemon' || crop === 'citrus')) {
        slugs.push('lemon-leaf-curl');
      } else if (disease === 'yellow-leaves' && crop === 'tomato') {
        slugs.push('tomato-yellow-leaves');
      } else {
        slugs.push(`${crop}-${disease}`, disease);
      }
    }
    slugs.push(`${crop}-tree`, crop);
  }
  for (const disease of diseases) slugs.push(disease);
  return [...new Set(slugs)];
}

export interface QuestionAnalysis {
  language: QueryLanguage;
  crops: CropId[];
  diseases: string[];
  symptoms: string[];
  location: string | null;
  rawQuestion: string;
}

function detectLanguage(query: string): QueryLanguage {
  if (TR_HINTS.test(query)) return 'tr';
  const turkishChars = /[çğıöşüÇĞİÖŞÜ]/;
  if (turkishChars.test(query)) return 'tr';
  return 'en';
}

function detectDiseases(query: string): string[] {
  const q = query.toLowerCase();
  const found: string[] = [];
  for (const [slug, hints] of Object.entries(DISEASE_HINTS)) {
    if (hints.some((h) => q.includes(h))) found.push(slug);
  }
  return found;
}

function detectSymptoms(query: string): string[] {
  const q = query.toLowerCase();
  const symptoms: string[] = [];
  const patterns: [string, RegExp][] = [
    ['leaf_drop', /dökül|dokul|drop/i],
    ['yellowing', /sarar|yellow|sarı|sari/i],
    ['curling', /kıvrıl|kivril|curl/i],
    ['spots', /leke|spot/i],
    ['wilting', /solma|wilt/i],
  ];
  for (const [sym, re] of patterns) {
    if (re.test(q)) symptoms.push(sym);
  }
  return symptoms;
}

export function analyzeQuestion(question: string): QuestionAnalysis {
  const trimmed = question.trim();
  return {
    language: detectLanguage(trimmed),
    crops: detectCropsFromQuery(trimmed),
    diseases: detectDiseases(trimmed),
    symptoms: detectSymptoms(trimmed),
    location: null,
    rawQuestion: trimmed,
  };
}
