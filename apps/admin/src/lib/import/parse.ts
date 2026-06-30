import type { KnowledgeRecord } from './types';
import { KNOWLEDGE_FIELDS } from './types';

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? '';
    });
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current);
  return result.map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

export function parseJSON(text: string): Record<string, unknown>[] {
  const parsed = JSON.parse(text) as unknown;
  if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { rows?: unknown[] }).rows)) {
    return (parsed as { rows: Record<string, unknown>[] }).rows;
  }
  throw new Error('JSON must be an array of objects or { "rows": [...] }');
}

export function normalizeKnowledgeRows(rows: Record<string, unknown>[]): KnowledgeRecord[] {
  return rows.map((row, index) => {
    const name_tr = String(row.name_tr ?? '').trim();
    const name_en = String(row.name_en ?? '').trim();
    const slug = String(row.slug ?? '').trim();

    if (!name_tr || !name_en || !slug) {
      throw new Error(`Row ${index + 1}: name_tr, name_en, and slug are required`);
    }

    const record: KnowledgeRecord = { name_tr, name_en, slug };

    for (const field of KNOWLEDGE_FIELDS) {
      if (field === 'name_tr' || field === 'name_en' || field === 'slug' || field === 'metadata') {
        continue;
      }
      const value = row[field];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        record[field] = String(value);
      }
    }

    if (row.metadata !== undefined && row.metadata !== null && row.metadata !== '') {
      record.metadata =
        typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata as Record<string, unknown>);
    }

    return record;
  });
}
