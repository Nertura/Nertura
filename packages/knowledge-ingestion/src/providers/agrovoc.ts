import type {
  CollectedIngestionItem,
  IngestionCollectOptions,
  KnowledgeIngestionProvider,
  KnowledgeSourceRow,
} from '../types';

const SPARQL_ENDPOINT = 'https://agrovoc.fao.org/sparql';

const DEFAULT_SEARCH_TERMS = ['tomato', 'wheat', 'phytophthora', 'aphid', 'olive'];

function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class AgrovocProvider implements KnowledgeIngestionProvider {
  readonly id = 'agrovoc';
  readonly displayName = 'FAO AGROVOC';

  isConfigured(): boolean {
    return true;
  }

  async collect(
    source: KnowledgeSourceRow,
    options: IngestionCollectOptions = {}
  ): Promise<CollectedIngestionItem[]> {
    const limit = Math.min(options.limit ?? 5, 10);
    const terms = (options.searchTerms?.length ? options.searchTerms : DEFAULT_SEARCH_TERMS).slice(
      0,
      limit
    );
    const items: CollectedIngestionItem[] = [];

    for (const term of terms) {
      if (items.length >= limit) break;
      try {
        const concept = await this.lookupTerm(term);
        if (concept) items.push(concept);
      } catch {
        // Skip failed term — do not retry aggressively
      }
      await sleep(300);
    }

    return items.slice(0, limit);
  }

  private async lookupTerm(term: string): Promise<CollectedIngestionItem | null> {
    const query = `
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      SELECT ?concept ?prefLabel ?altLabel ?definition WHERE {
        ?concept a skos:Concept ;
                 skos:prefLabel ?prefLabel .
        OPTIONAL { ?concept skos:altLabel ?altLabel . FILTER (lang(?altLabel) = "en") }
        OPTIONAL {
          ?concept skos:definition ?definition .
          FILTER (lang(?definition) = "en")
        }
        FILTER (lang(?prefLabel) = "en")
        FILTER (regex(?prefLabel, "${escapeRegex(term)}", "i"))
      }
      LIMIT 1
    `;

    const res = await fetch(SPARQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        Accept: 'application/sparql-results+json',
        'User-Agent': 'Nertura-Knowledge-Ingestion/1.0 (review-first; contact: admin@nertura.com)',
      },
      body: query,
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      results?: {
        bindings?: Array<{
          concept?: { value?: string };
          prefLabel?: { value?: string };
          altLabel?: { value?: string };
          definition?: { value?: string };
        }>;
      };
    };

    const row = json.results?.bindings?.[0];
    if (!row?.prefLabel?.value) return null;

    const conceptUri = row.concept?.value ?? '';
    const prefLabel = row.prefLabel.value;
    const altLabel = row.altLabel?.value;
    const definition = row.definition?.value;

    const rawParts = [
      `AGROVOC concept: ${prefLabel}`,
      altLabel ? `Also known as: ${altLabel}` : null,
      definition ? `Definition: ${definition}` : null,
      `URI: ${conceptUri}`,
      '',
      'VOCABULARY REFERENCE ONLY — not a diagnosis or treatment recommendation.',
    ].filter(Boolean);

    const tags = classifyAgrovocTerm(prefLabel, definition);

    return {
      title: `AGROVOC: ${prefLabel}`,
      rawText: rawParts.join('\n'),
      language: 'en',
      crop: tags.crop,
      disease: tags.disease,
      pest: tags.pest,
      symptom: tags.symptom,
      sourceUrl: conceptUri,
      citation: `FAO AGROVOC Concept — ${prefLabel} (${conceptUri}). CC BY 4.0.`,
      metadata: {
        provider: this.id,
        concept_uri: conceptUri,
        vocabulary_only: true,
        license: 'CC BY 4.0',
      },
    };
  }
}

function classifyAgrovocTerm(label: string, definition?: string): {
  crop: string | null;
  disease: string | null;
  pest: string | null;
  symptom: string | null;
} {
  const text = `${label} ${definition ?? ''}`.toLowerCase();
  const crop =
    /\b(tomato|wheat|maize|corn|olive|rice|potato|grape|citrus)\b/.exec(text)?.[1] ?? null;
  const disease =
    /\b(blight|mildew|rust|rot|wilt|mosaic|scab)\b/.exec(text)?.[1] ?? null;
  const pest = /\b(aphid|mite|nematode|weevil|borer)\b/.exec(text)?.[1] ?? null;
  const symptom = /\b(spot|lesion|chlorosis|necrosis|wilting)\b/.exec(text)?.[1] ?? null;
  return { crop, disease, pest, symptom };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Public helper for term normalization (no treatment claims). */
export async function searchAgrovocConcepts(term: string, limit = 5): Promise<string[]> {
  const provider = new AgrovocProvider();
  const items = await provider.collect(
    {
      id: '',
      name: 'AGROVOC',
      type: 'official_api',
      base_url: SPARQL_ENDPOINT,
      license_notes: null,
      trust_level: 'high',
      enabled: true,
      schedule: 'daily',
      config: { provider: 'agrovoc' },
    },
    { limit, searchTerms: [term] }
  );
  return items.map((i) => i.title.replace(/^AGROVOC: /, ''));
}
