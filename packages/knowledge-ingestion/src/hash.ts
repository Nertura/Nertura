import { createHash } from 'node:crypto';

/** Stable duplicate hash — title + source_url + normalized_text prefix */
export function computeDuplicateHash(parts: {
  title: string;
  sourceUrl?: string | null;
  normalizedText: string;
}): string {
  const payload = [
    parts.title.trim().toLowerCase(),
    (parts.sourceUrl ?? '').trim().toLowerCase(),
    parts.normalizedText.trim().toLowerCase().slice(0, 2000),
  ].join('|');
  return createHash('sha256').update(payload).digest('hex');
}

export function normalizeIngestionText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
