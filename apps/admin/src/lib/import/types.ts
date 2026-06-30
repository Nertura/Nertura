export const KNOWLEDGE_ITEM_TYPES = [
  'plant',
  'disease',
  'pest',
  'treatment',
  'fertilizer',
  'soil',
  'irrigation',
  'article',
] as const;

export type KnowledgeItemType = (typeof KNOWLEDGE_ITEM_TYPES)[number];

const LEGACY_TABLES = [
  'plants',
  'plant_diseases',
  'plant_pests',
  'treatments',
  'fertilizers',
  'knowledge_articles',
] as const;

export const KNOWLEDGE_IMPORT_TABLES = ['knowledge_items', ...LEGACY_TABLES] as const;

export type KnowledgeImportTable = (typeof KNOWLEDGE_IMPORT_TABLES)[number];

export interface KnowledgeItemRecord {
  type: KnowledgeItemType;
  name_tr: string;
  name_en: string;
  slug: string;
  summary_tr?: string | null;
  summary_en?: string | null;
  symptoms?: unknown;
  causes?: unknown;
  treatments?: unknown;
  prevention?: unknown;
  related_crops?: unknown;
  metadata?: Record<string, unknown>;
  source?: string | null;
  confidence_level?: number | null;
}

export const KNOWLEDGE_ITEM_FIELDS = [
  'type',
  'name_tr',
  'name_en',
  'slug',
  'summary_tr',
  'summary_en',
  'symptoms',
  'causes',
  'treatments',
  'prevention',
  'related_crops',
  'source',
  'confidence_level',
  'metadata',
] as const;

export interface KnowledgeRecord {
  name_tr: string;
  name_en: string;
  slug: string;
  description_tr?: string | null;
  description_en?: string | null;
  category?: string | null;
  symptoms?: string | null;
  causes?: string | null;
  treatment?: string | null;
  prevention?: string | null;
  metadata?: Record<string, unknown>;
}

export const KNOWLEDGE_FIELDS = [
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
  'metadata',
] as const;
