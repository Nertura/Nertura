import type {
  CollectedIngestionItem,
  IngestionCollectOptions,
  KnowledgeIngestionProvider,
  KnowledgeSourceRow,
} from '../types';

const SOILGRIDS_BASE = 'https://rest.isric.org/soilgrids/v2.0/properties/query';

export interface SoilGridsQueryResult {
  available: boolean;
  properties?: Record<string, unknown>;
  error?: string;
}

/** Safe SoilGrids query — returns null data when API unavailable (no fake values). */
export async function querySoilGridsByCoordinates(
  lat: number,
  lon: number
): Promise<SoilGridsQueryResult> {
  const url = new URL(SOILGRIDS_BASE);
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('property', 'clay,sand,silt,phh2o,cec,soc');
  url.searchParams.set('depth', '0-5cm');
  url.searchParams.set('value', 'mean');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Nertura-Knowledge-Ingestion/1.0',
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      return { available: false, error: `SoilGrids HTTP ${res.status}` };
    }
    const json = (await res.json()) as Record<string, unknown>;
    return { available: true, properties: json };
  } catch (err) {
    return {
      available: false,
      error: err instanceof Error ? err.message : 'SoilGrids request failed',
    };
  }
}

export class SoilGridsProvider implements KnowledgeIngestionProvider {
  readonly id = 'soilgrids';
  readonly displayName = 'ISRIC SoilGrids';

  isConfigured(): boolean {
    return true;
  }

  async collect(
    source: KnowledgeSourceRow,
    options: IngestionCollectOptions = {}
  ): Promise<CollectedIngestionItem[]> {
    const lat = options.latitude;
    const lon = options.longitude;

    if (lat == null || lon == null) {
      return [
        {
          title: 'SoilGrids: coordinates required',
          rawText:
            'SoilGrids ingestion requires farm/field coordinates. No soil data was fetched. ' +
            'This is a context placeholder — connect field centroids in a future sprint.',
          language: 'en',
          sourceUrl: source.base_url,
          citation: 'ISRIC SoilGrids — https://soilgrids.org (no query executed)',
          metadata: {
            provider: this.id,
            skipped: true,
            reason: 'missing_coordinates',
          },
        },
      ];
    }

    const result = await querySoilGridsByCoordinates(lat, lon);

    if (!result.available || !result.properties) {
      return [
        {
          title: `SoilGrids context (${lat.toFixed(4)}, ${lon.toFixed(4)}) — unavailable`,
          rawText: [
            `Location: ${lat}, ${lon}`,
            `SoilGrids API could not be reached: ${result.error ?? 'unknown error'}`,
            'No soil values were invented. Retry when API is available.',
          ].join('\n'),
          language: 'en',
          region: `${lat},${lon}`,
          sourceUrl: source.base_url,
          citation: 'ISRIC SoilGrids — query failed; no data fabricated',
          metadata: { provider: this.id, api_error: result.error },
        },
      ];
    }

    return [
      {
        title: `SoilGrids soil properties (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        rawText: JSON.stringify(result.properties, null, 2),
        language: 'en',
        region: `${lat},${lon}`,
        sourceUrl: `${SOILGRIDS_BASE}?lat=${lat}&lon=${lon}`,
        citation:
          'ISRIC SoilGrids v2.0 — soil property maps. Context only; not agronomic prescription.',
        metadata: {
          provider: this.id,
          coordinates: { lat, lon },
          raw_api: result.properties,
          license: 'CC BY 4.0',
        },
      },
    ];
  }
}
