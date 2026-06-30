import { getMapboxAccessToken } from '../map/types';
import type { LatLng } from '../types';
import type { ForwardGeocodingProvider } from './forward-geocoding';
import { MapboxForwardGeocodingProvider, StubForwardGeocodingProvider } from './forward-geocoding';
import type { ReverseGeocodeResult, ReverseGeocodingProvider } from './reverse-geocoding';
import type { SatelliteProvider, SatelliteScene } from './satellite';
import type { SoilProvider, SoilSample } from './soil';
import type { WeatherProvider, WeatherSnapshot } from './weather';
import type { GeoJsonPolygonFeature } from '../types';

export class StubReverseGeocodingProvider implements ReverseGeocodingProvider {
  readonly id = 'stub-reverse-geocode';

  isConfigured(): boolean {
    return true;
  }

  async reverseGeocode(point: LatLng): Promise<ReverseGeocodeResult | null> {
    return {
      label: `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`,
      raw: { stub: true, lat: point.lat, lng: point.lng },
    };
  }
}

export class StubWeatherProvider implements WeatherProvider {
  readonly id = 'stub-weather';

  isConfigured(): boolean {
    return true;
  }

  async getCurrentWeather(point: LatLng): Promise<WeatherSnapshot | null> {
    return {
      temperatureC: null,
      humidityPct: null,
      windSpeedKmh: null,
      condition: 'unavailable',
      fetchedAt: new Date().toISOString(),
      provider: this.id,
      stub: true,
    };
  }
}

export class StubSoilProvider implements SoilProvider {
  readonly id = 'stub-soil';

  isConfigured(): boolean {
    return true;
  }

  async getSoilAtPoint(point: LatLng): Promise<SoilSample | null> {
    return {
      soilType: null,
      ph: null,
      organicMatterPct: null,
      texture: null,
      fetchedAt: new Date().toISOString(),
      provider: this.id,
      stub: true,
    };
  }
}

export class StubSatelliteProvider implements SatelliteProvider {
  readonly id = 'stub-satellite';

  isConfigured(): boolean {
    return true;
  }

  async getLatestScene(_boundary: GeoJsonPolygonFeature): Promise<SatelliteScene | null> {
    return {
      sceneId: 'stub-scene',
      capturedAt: new Date().toISOString(),
      cloudCoverPct: null,
      provider: this.id,
      stub: true,
      previewUrl: null,
    };
  }
}

export interface GeoIntelligenceProviders {
  reverseGeocoding: ReverseGeocodingProvider;
  forwardGeocoding: ForwardGeocodingProvider;
  weather: WeatherProvider;
  soil: SoilProvider;
  satellite: SatelliteProvider;
}

export function createStubGeoProviders(): GeoIntelligenceProviders {
  return {
    reverseGeocoding: new StubReverseGeocodingProvider(),
    forwardGeocoding: new StubForwardGeocodingProvider(),
    weather: new StubWeatherProvider(),
    soil: new StubSoilProvider(),
    satellite: new StubSatelliteProvider(),
  };
}

export class MapboxReverseGeocodingProvider implements ReverseGeocodingProvider {
  readonly id = 'mapbox-reverse-geocode';

  constructor(private accessToken?: string) {}

  isConfigured(): boolean {
    return Boolean(this.accessToken?.trim());
  }

  async reverseGeocode(point: LatLng): Promise<ReverseGeocodeResult | null> {
    if (!this.isConfigured()) return null;
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${point.lng},${point.lat}.json`
    );
    url.searchParams.set('access_token', this.accessToken!);
    url.searchParams.set('limit', '1');
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const json = (await res.json()) as {
      features?: Array<{
        place_name?: string;
        context?: Array<{ id: string; text: string; short_code?: string }>;
      }>;
    };
    const feature = json.features?.[0];
    if (!feature?.place_name) return null;
    const ctx = feature.context ?? [];
    const country = ctx.find((c) => c.id.startsWith('country'));
    const region = ctx.find((c) => c.id.startsWith('region'));
    const place = ctx.find((c) => c.id.startsWith('place'));
    return {
      label: feature.place_name,
      city: place?.text ?? null,
      district: region?.text ?? null,
      country: country?.text ?? null,
      countryCode: country?.short_code?.toUpperCase() ?? null,
      raw: feature as unknown as Record<string, unknown>,
    };
  }
}

export function createGeoProviders(options?: {
  mapboxToken?: string;
}): GeoIntelligenceProviders {
  const token = options?.mapboxToken ?? getMapboxAccessToken();
  const mapboxGeocode = new MapboxReverseGeocodingProvider(token);
  const mapboxForward = new MapboxForwardGeocodingProvider(token);
  return {
    reverseGeocoding: mapboxGeocode.isConfigured()
      ? mapboxGeocode
      : new StubReverseGeocodingProvider(),
    forwardGeocoding: mapboxForward.isConfigured()
      ? mapboxForward
      : new StubForwardGeocodingProvider(),
    weather: new StubWeatherProvider(),
    soil: new StubSoilProvider(),
    satellite: new StubSatelliteProvider(),
  };
}
