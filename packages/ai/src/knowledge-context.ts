import type { KnowledgeHit } from './types';
import { jsonToText } from './knowledge-search';

export function formatKnowledgeContext(hits: KnowledgeHit[]): string {
  if (!hits.length) return '';
  return hits
    .map((h) => {
      const parts = [
        `[${h.type}] ${h.name_en}`,
        h.summary_en || h.summary_tr || '',
        h.symptoms ? `Symptoms: ${jsonToText(h.symptoms)}` : '',
        h.treatments ? `Treatment: ${jsonToText(h.treatments)}` : '',
        h.prevention ? `Prevention: ${jsonToText(h.prevention)}` : '',
        h.causes ? `Crop/Disease: ${jsonToText(h.causes)}` : '',
      ].filter(Boolean);
      return parts.join('\n');
    })
    .join('\n\n');
}
