import {
  detectCropsFromQuery,
  extractRowCrops,
  rowMatchesCrops,
  tokenizeQuery,
  type CropId,
} from './crop-lexicon';
import {
  buildTurkishKbDiagnosis,
  pickLocalizedKbName,
  pickLocalizedKbSummary,
} from './language-output-normalizer';
import { buildNerturaSections, sectionsToDoctorAnswer } from './answer-formatter';
import { analyzeQuestion } from './question-analyzer';
import type { QueryLanguage } from './question-analyzer';
import type { KnowledgeHit } from './types';

export { detectCropsFromQuery, extractRowCrops, rowMatchesCrops, tokenizeQuery };

export interface KnowledgeSearchClient {
  from(table: string): {
    select(cols: string): {
      or(filter: string): {
        limit(n: number): PromiseLike<{ data: unknown[] | null; error: unknown }>;
      };
    };
  };
}

const SEARCH_COLUMNS = [
  'title',
  'category',
  'crop',
  'disease',
  'name_tr',
  'name_en',
  'slug',
  'summary_tr',
  'summary_en',
  'symptoms_text',
  'treatment',
  'prevention_text',
  'content',
] as const;

function sanitizeToken(token: string): string {
  return token.replace(/[,()*%\\]/g, '');
}

export function jsonToText(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(' ');
  if (typeof value === 'string') return value;
  return JSON.stringify(value ?? '');
}

function fieldText(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  if (v == null || v === '') return '';
  return String(v);
}

function scoreItem(
  row: Record<string, unknown>,
  tokens: string[],
  queryCrops: CropId[]
): number {
  const haystack = [
    fieldText(row, 'title'),
    fieldText(row, 'category'),
    fieldText(row, 'crop'),
    fieldText(row, 'disease'),
    row.name_tr,
    row.name_en,
    row.slug,
    row.summary_tr,
    row.summary_en,
    fieldText(row, 'symptoms_text'),
    jsonToText(row.symptoms),
    fieldText(row, 'treatment'),
    jsonToText(row.treatments),
    fieldText(row, 'prevention_text'),
    jsonToText(row.prevention),
    fieldText(row, 'content'),
    jsonToText(row.related_crops),
  ]
    .map(String)
    .join(' ')
    .toLowerCase();

  const title = fieldText(row, 'title').toLowerCase() || String(row.name_en ?? '').toLowerCase();
  const crop = fieldText(row, 'crop').toLowerCase();
  const slug = String(row.slug ?? '').toLowerCase();
  const disease = fieldText(row, 'disease').toLowerCase();

  let best = 0;
  for (const token of tokens) {
    const safe = sanitizeToken(token);
    if (!safe) continue;

    if (title === safe || crop === safe || disease === safe || slug === safe) {
      best = Math.max(best, 1);
    } else if (
      title.includes(safe) ||
      crop.includes(safe) ||
      disease.includes(safe) ||
      slug.includes(safe)
    ) {
      best = Math.max(best, 0.92);
    } else if (String(row.name_en ?? '').toLowerCase().includes(safe)) {
      best = Math.max(best, 0.88);
    } else if (String(row.name_tr ?? '').toLowerCase().includes(safe)) {
      best = Math.max(best, 0.86);
    } else if (haystack.includes(safe)) {
      best = Math.max(best, 0.55);
    }
  }

  // Crop-aware re-ranking — critical for olive vs tomato accuracy
  if (queryCrops.length > 0) {
    if (rowMatchesCrops(row, queryCrops)) {
      best = Math.min(1, best + 0.22);
      // Primary plant record for detected crop gets extra boost
      const type = String(row.type ?? row.category ?? '').toLowerCase();
      if (type === 'plant') best = Math.min(1, best + 0.08);
    } else {
      // Penalize wrong-crop matches (e.g. tomato when user asked about olive)
      best *= 0.4;
    }
  }

  return best;
}

export async function searchKnowledgeItems(
  supabase: KnowledgeSearchClient,
  query: string,
  limit = 5
): Promise<KnowledgeHit[]> {
  const queryCrops = detectCropsFromQuery(query);
  const tokens = tokenizeQuery(query);

  // Always include detected crop names as search tokens
  for (const crop of queryCrops) {
    if (!tokens.includes(crop)) tokens.push(crop);
  }

  if (!tokens.length) return [];

  const orFilter = tokens
    .flatMap((token) => {
      const pattern = `%${sanitizeToken(token)}%`;
      return SEARCH_COLUMNS.map((col) => `${col}.ilike.${pattern}`);
    })
    .join(',');

  const { data, error } = await supabase
    .from('knowledge_items')
    .select(
      'type, slug, title, category, crop, disease, name_tr, name_en, summary_tr, summary_en, symptoms, symptoms_text, treatment, treatments, prevention, prevention_text, content, language, source, related_crops'
    )
    .or(orFilter)
    .limit(40);

  if (error || !data?.length) return [];

  const scored = (data as Record<string, unknown>[])
    .map((row) => ({
      slug: String(row.slug),
      type: String(row.category ?? row.type ?? 'article'),
      name_tr: String(row.name_tr ?? row.title ?? ''),
      name_en: String(row.title ?? row.name_en ?? ''),
      summary_tr: row.summary_tr as string | null,
      summary_en: (row.content as string | null) ?? (row.summary_en as string | null),
      symptoms: row.symptoms_text ?? row.symptoms,
      causes: row.disease ?? row.crop,
      treatments: row.treatment ?? row.treatments,
      prevention: row.prevention_text ?? row.prevention,
      score: scoreItem(row, tokens, queryCrops),
      _row: row,
    }))
    .filter((h) => h.score >= 0.45);

  // Prefer crop-matching hits when user specified a crop
  if (queryCrops.length > 0) {
    const matching = scored.filter((h) => rowMatchesCrops(h._row, queryCrops));
    if (matching.length > 0) {
      return matching
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ _row: _, ...hit }) => hit);
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ _row: _, ...hit }) => hit);
}

export function knowledgeHitToAnswer(
  hit: KnowledgeHit,
  language: QueryLanguage = 'tr',
  question = ''
) {
  const lang = language;
  const name = pickLocalizedKbName(hit, lang);
  const summary = pickLocalizedKbSummary(hit, lang);

  if (lang === 'tr' && (!name || !summary)) {
    throw new Error('KB_TR_CONTENT_MISSING');
  }

  const diagnosis =
    lang === 'tr'
      ? buildTurkishKbDiagnosis(name, summary, question)
      : summary
        ? `${name}: ${summary.slice(0, 220)}`
        : name;

  const trToday =
    'Güneş alan ve rüzgârdan korunaklı bir yer seçin.\nToprağı organik maddeyle güçlendirin.\nDon riski geçmeden fide dikimi yapmayın.';
  const enToday =
    'Choose a sunny, sheltered spot.\nImprove soil with organic matter.\nPlant after frost risk passes.';

  const isGrowingQuestion = /yetiş|yetis|dikim|ekim|yetiştir|yetistir|yetişir|yetisir/.test(
    question.toLowerCase()
  );

  const sections = buildNerturaSections({
    language: lang,
    diagnosis,
    possibleCauses:
      lang === 'tr'
        ? 'İklim, toprak yapısı, sulama ve beslenme birlikte etkili olabilir.'
        : jsonToText(hit.causes) || jsonToText(hit.symptoms) || 'Not specified',
    riskLevel: hit.score >= 0.85 ? 'medium' : 'low',
    immediateAction:
      lang === 'tr'
        ? isGrowingQuestion
          ? trToday
          : 'Bitkileri yakından gözlemleyin; belirtiler yayılıyorsa net bir fotoğraf çekip tekrar sorun.'
        : 'Photograph symptoms; isolate affected leaves if spreading and keep a field log.',
    treatmentPlan:
      lang === 'tr'
        ? 'Yerel iklim ve ürün rehberine göre bakım planı uygulayın.'
        : jsonToText(hit.treatments) || 'Not specified',
    prevention:
      lang === 'tr'
        ? 'Düzenli gözlem, dengeli sulama ve uygun gübreleme yapın.'
        : jsonToText(hit.prevention) || 'Regular monitoring and balanced care.',
    expertWarning:
      lang === 'tr'
        ? isGrowingQuestion
          ? 'Don riski, aşırı sulama ve hastalık belirtilerini yakından izleyin. Kesin teşhis için yerel uzmana danışın.'
          : 'Tarla koşulları değişkendir. Belirtiler karışabilir — yerel ziraat mühendisine danışın.'
        : undefined,
    topHit: hit,
  });

  return sectionsToDoctorAnswer(sections, lang, {
    confidence: Math.min(0.98, hit.score),
    source: 'knowledge_base',
    matched_slug: hit.slug,
    matched_type: hit.type,
    disclaimer: '',
    internalNotes: `Nertura KB: ${hit.type}/${hit.slug} (${(hit.score * 100).toFixed(0)}%)`,
  });
}

/** True when KB-only answer is safe for this question + top hit */
export function isHighConfidenceKbMatch(
  topHit: KnowledgeHit | undefined,
  query: string,
  threshold: number
): boolean {
  if (!topHit || topHit.score < threshold) return false;
  const queryCrops = detectCropsFromQuery(query);
  if (!queryCrops.length) return true;
  return queryCrops.some(
    (c) => topHit.slug.includes(c) || topHit.name_en.toLowerCase().includes(c)
  );
}
