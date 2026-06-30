import type { MapBounds } from '../map/types';
import type { LatLng } from '../types';

export interface GeocodeSearchResult {
  label: string;
  center: LatLng;
  bbox?: MapBounds;
}

export interface ForwardGeocodingProvider {
  readonly id: string;
  isConfigured(): boolean;
  search(
    query: string,
    options?: { proximity?: LatLng; limit?: number; language?: string }
  ): Promise<GeocodeSearchResult[]>;
}

export class StubForwardGeocodingProvider implements ForwardGeocodingProvider {
  readonly id = 'stub-forward-geocode';

  isConfigured(): boolean {
    return true;
  }

  async search(): Promise<GeocodeSearchResult[]> {
    return [];
  }
}

export class MapboxForwardGeocodingProvider implements ForwardGeocodingProvider {
  readonly id = 'mapbox-forward-geocode';

  constructor(private accessToken?: string) {}

  isConfigured(): boolean {
    return Boolean(this.accessToken?.trim());
  }

  async search(
    query: string,
    options?: { proximity?: LatLng; limit?: number; language?: string }
  ): Promise<GeocodeSearchResult[]> {
    const q = query.trim();
    if (!q || !this.isConfigured()) return [];

    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
    );
    url.searchParams.set('access_token', this.accessToken!);
    url.searchParams.set('limit', String(options?.limit ?? 5));
    url.searchParams.set('types', 'place,locality,neighborhood,district,address,poi');
    if (options?.language) url.searchParams.set('language', options.language);
    if (options?.proximity) {
      url.searchParams.set('proximity', `${options.proximity.lng},${options.proximity.lat}`);
    }

    const res = await fetch(url.toString());
    if (!res.ok) return [];

    const json = (await res.json()) as {
      features?: Array<{
        place_name?: string;
        center?: [number, number];
        bbox?: [number, number, number, number];
      }>;
    };

    return (json.features ?? [])
      .filter((f) => f.place_name && f.center?.length === 2)
      .map((f) => {
        const [lng, lat] = f.center!;
        const result: GeocodeSearchResult = {
          label: f.place_name!,
          center: { lng, lat },
        };
        if (f.bbox && f.bbox.length === 4) {
          const [west, south, east, north] = f.bbox;
          result.bbox = { west, south, east, north };
        }
        return result;
      });
  }
}
