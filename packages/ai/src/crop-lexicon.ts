/**
 * Canonical crop IDs and multilingual aliases for query + KB matching.
 * Extend as knowledge bank grows to 10k+ records.
 */

export type CropId =
  | 'olive'
  | 'tomato'
  | 'wheat'
  | 'potato'
  | 'pepper'
  | 'corn'
  | 'citrus'
  | 'lemon'
  | 'grape'
  | 'cotton'
  | 'rice'
  | 'soybean'
  | 'sunflower'
  | 'apple'
  | 'banana'
  | 'cucumber';

/** alias (lowercase) → canonical crop id */
export const CROP_ALIASES: Record<string, CropId> = {
  olive: 'olive',
  olives: 'olive',
  zeytin: 'olive',
  zeytinagaci: 'olive',
  'olive-tree': 'olive',
  'olive tree': 'olive',
  'olive trees': 'olive',
  olea: 'olive',

  tomato: 'tomato',
  tomatoes: 'tomato',
  domates: 'tomato',

  wheat: 'wheat',
  bugday: 'wheat',
  buğday: 'wheat',

  potato: 'potato',
  potatoes: 'potato',
  patates: 'potato',

  pepper: 'pepper',
  peppers: 'pepper',
  biber: 'pepper',

  corn: 'corn',
  maize: 'corn',
  misir: 'corn',
  mısır: 'corn',

  citrus: 'citrus',
  turuncgiller: 'citrus',
  lemon: 'lemon',
  lemons: 'lemon',
  limon: 'lemon',

  grape: 'grape',
  grapes: 'grape',
  uzum: 'grape',
  üzüm: 'grape',

  cotton: 'cotton',
  pamuk: 'cotton',

  rice: 'rice',
  pirinc: 'rice',
  pirinç: 'rice',

  soybean: 'soybean',
  soya: 'soybean',

  sunflower: 'sunflower',
  ayçiçeği: 'sunflower',
  aycicegi: 'sunflower',

  apple: 'apple',
  elma: 'apple',

  banana: 'banana',
  muz: 'banana',

  cucumber: 'cucumber',
  cucumbers: 'cucumber',
  salatalik: 'cucumber',
  salatalık: 'cucumber',
  hiyar: 'cucumber',
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'shall',
  'can',
  'need',
  'what',
  'which',
  'who',
  'whom',
  'this',
  'that',
  'these',
  'those',
  'am',
  'how',
  'why',
  'when',
  'where',
  'my',
  'your',
  'our',
  'their',
  'on',
  'in',
  'at',
  'to',
  'for',
  'of',
  'with',
  'about',
  'from',
  'into',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'all',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'and',
  'but',
  'if',
  'or',
  'because',
  'as',
  'until',
  'while',
  'causes',
  'cause',
  'causing',
  'leaves',
  'leaf',
  'plant',
  'plants',
  'tree',
  'trees',
  'crop',
  'crops',
  'farm',
  'field',
  'help',
  'please',
  'question',
]);

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Simple plural trim for English tokens */
function singularize(token: string): string {
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('es') && token.length > 3) return token.slice(0, -2);
  if (token.endsWith('s') && token.length > 3) return token.slice(0, -1);
  return token;
}

/**
 * Detect canonical crop IDs mentioned in a farmer question.
 */
export function detectCropsFromQuery(query: string): CropId[] {
  const q = query.toLowerCase();
  const found = new Set<CropId>();

  // Phrase match first (longer aliases)
  const sortedAliases = Object.keys(CROP_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of sortedAliases) {
    if (q.includes(alias)) {
      found.add(CROP_ALIASES[alias]!);
    }
  }

  // Token match for single words
  const tokens = q.split(/[\s,.;:!?/\\()-]+/).map(normalizeToken).filter(Boolean);
  for (const token of tokens) {
    const candidates = [token, singularize(token)];
    for (const c of candidates) {
      if (CROP_ALIASES[c]) found.add(CROP_ALIASES[c]!);
    }
  }

  return [...found];
}

export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,.;:!?/\\()-]+/)
    .map(normalizeToken)
    .map(singularize)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

export function extractRowCrops(row: Record<string, unknown>): CropId[] {
  const crops = new Set<CropId>();

  const slug = String(row.slug ?? '').toLowerCase();
  const cropField = String(row.crop ?? '').toLowerCase();
  const title = String(row.title ?? row.name_en ?? '').toLowerCase();

  for (const [alias, id] of Object.entries(CROP_ALIASES)) {
    if (slug.includes(alias) || cropField === alias || cropField === id) {
      crops.add(id);
    }
    if (title.includes(alias)) crops.add(id);
  }

  const related = row.related_crops;
  if (Array.isArray(related)) {
    for (const r of related) {
      const key = String(r).toLowerCase();
      if (CROP_ALIASES[key]) crops.add(CROP_ALIASES[key]!);
    }
  } else if (typeof related === 'string') {
    try {
      const parsed = JSON.parse(related) as unknown[];
      for (const r of parsed) {
        const key = String(r).toLowerCase();
        if (CROP_ALIASES[key]) crops.add(CROP_ALIASES[key]!);
      }
    } catch {
      // ignore
    }
  }

  return [...crops];
}

export function rowMatchesCrops(row: Record<string, unknown>, crops: CropId[]): boolean {
  if (!crops.length) return true;
  const rowCrops = extractRowCrops(row);
  if (!rowCrops.length) return false;
  return crops.some((c) => rowCrops.includes(c));
}

export function formatCropContext(crops: CropId[]): string {
  if (!crops.length) return '';
  return crops.join(', ');
}
