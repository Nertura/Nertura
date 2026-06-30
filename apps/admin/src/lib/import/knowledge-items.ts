import type { KnowledgeItemRecord, KnowledgeItemType } from './types';
import { KNOWLEDGE_ITEM_FIELDS, KNOWLEDGE_ITEM_TYPES } from './types';

function parseJsonField(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return value;
}

export function normalizeKnowledgeItemRows(
  rows: Record<string, unknown>[]
): { records: KnowledgeItemRecord[]; errors: string[] } {
  const records: KnowledgeItemRecord[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const name_tr = String(row.name_tr ?? '').trim();
    const name_en = String(row.name_en ?? '').trim();
    const slug = String(row.slug ?? '').trim();
    const type = String(row.type ?? 'article').trim() as KnowledgeItemType;

    if (!name_tr || !name_en || !slug) {
      errors.push(`Satır ${index + 1}: type, name_tr, name_en, slug zorunlu`);
      return;
    }

    if (!KNOWLEDGE_ITEM_TYPES.includes(type)) {
      errors.push(`Satır ${index + 1}: geçersiz type "${type}"`);
      return;
    }

    const record: KnowledgeItemRecord = { type, name_tr, name_en, slug };

    for (const field of KNOWLEDGE_ITEM_FIELDS) {
      if (field === 'type' || field === 'name_tr' || field === 'name_en' || field === 'slug') {
        continue;
      }
      const value = row[field];
      if (value === undefined || value === null || String(value).trim() === '') continue;

      if (['symptoms', 'causes', 'treatments', 'prevention', 'related_crops', 'metadata'].includes(field)) {
        Object.assign(record, { [field]: parseJsonField(value) });
      } else if (field === 'confidence_level') {
        record.confidence_level = Number(value);
      } else {
        Object.assign(record, { [field]: String(value) });
      }
    }

    records.push(record);
  });

  return { records, errors };
}
