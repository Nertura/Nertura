import type { SupabaseClient } from '@supabase/supabase-js';

export interface KnowledgeRow {
  slug: string;
  name_tr: string;
  name_en: string;
  description_tr?: string | null;
  description_en?: string | null;
  category?: string | null;
  symptoms?: string | null;
  causes?: string | null;
  treatment?: string | null;
  prevention?: string | null;
}

export interface KnowledgeHit {
  table: string;
  row: KnowledgeRow;
  score: number;
}

const SEARCH_TABLES = [
  'knowledge_articles',
  'plants',
  'plant_diseases',
  'plant_pests',
  'treatments',
] as const;

const SEARCH_COLUMNS = [
  'name_tr',
  'name_en',
  'slug',
  'description_tr',
  'description_en',
  'category',
  'symptoms',
  'causes',
  'treatment',
  'prevention',
] as const;

const RELEVANCE_THRESHOLD = 0.45;

function sanitizeToken(token: string): string {
  return token.replace(/[,()*%\\]/g, '');
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,.;:!?/\\-]+/)
    .map((t) => sanitizeToken(t.trim()))
    .filter((t) => t.length >= 2);
}

function scoreRow(row: KnowledgeRow, tokens: string[]): number {
  if (!tokens.length) return 0;

  const haystack = SEARCH_COLUMNS.map((col) => String(row[col as keyof KnowledgeRow] ?? ''))
    .join(' ')
    .toLowerCase();

  let best = 0;

  for (const token of tokens) {
    const nameTr = row.name_tr.toLowerCase();
    const nameEn = row.name_en.toLowerCase();
    const slug = row.slug.toLowerCase();

    if (nameTr === token || nameEn === token) {
      best = Math.max(best, 1);
      continue;
    }
    if (nameTr.includes(token) || nameEn.includes(token)) {
      best = Math.max(best, 0.88);
      continue;
    }
    if (slug.includes(token)) {
      best = Math.max(best, 0.82);
      continue;
    }
    if (haystack.includes(token)) {
      best = Math.max(best, 0.55);
    }
  }

  return best;
}

async function searchTable(
  supabase: SupabaseClient,
  table: string,
  tokens: string[]
): Promise<KnowledgeHit[]> {
  if (!tokens.length) return [];

  const orFilter = tokens
    .flatMap((token) => {
      const pattern = `%${token}%`;
      return SEARCH_COLUMNS.map((col) => `${col}.ilike.${pattern}`);
    })
    .join(',');

  const { data, error } = await supabase.from(table).select('*').or(orFilter).limit(10);

  if (error || !data?.length) return [];

  return (data as KnowledgeRow[])
    .map((row) => ({ table, row, score: scoreRow(row, tokens) }))
    .filter((hit) => hit.score >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

/** Search KB tables in priority order; return first relevant hit or best overall. */
export async function searchKnowledgeBase(
  supabase: SupabaseClient,
  query: string
): Promise<KnowledgeHit | null> {
  const tokens = tokenize(query);
  if (!tokens.length) return null;

  let bestOverall: KnowledgeHit | null = null;

  for (const table of SEARCH_TABLES) {
    const hits = await searchTable(supabase, table, tokens);
    if (!hits.length) continue;

    const top = hits[0];
    if (!bestOverall || top.score > bestOverall.score) {
      bestOverall = top;
    }

    if (top.score >= 0.75) {
      return top;
    }
  }

  return bestOverall;
}

export function knowledgeHitToDiagnosis(hit: KnowledgeHit) {
  const { row, table, score } = hit;
  const description = row.description_tr || row.description_en || '';

  return {
    diagnosis: `${row.name_tr} (${row.name_en})${description ? ` — ${description}` : ''}`,
    possible_causes: row.causes || row.symptoms || 'Belirtilmemiş',
    treatment: row.treatment || 'Belirtilmemiş',
    prevention: row.prevention || 'Belirtilmemiş',
    confidence: Math.min(0.95, Math.round(score * 100) / 100),
    source: 'knowledge_base' as const,
    matched_table: table,
    matched_slug: row.slug,
  };
}
