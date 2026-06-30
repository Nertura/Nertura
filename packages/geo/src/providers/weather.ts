import type { LatLng } from '../types';

export interface WeatherSnapshot {
  temperatureC?: number | null;
  humidityPct?: number | null;
  windSpeedKmh?: number | null;
  condition?: string | null;
  fetchedAt: string;
  provider: string;
  stub?: boolean;
}

export interface WeatherProvider {
  readonly id: string;
  isConfigured(): boolean;
  getCurrentWeather(point: LatLng): Promise<WeatherSnapshot | null>;
  getForecast?(point: LatLng, days?: number): Promise<WeatherSnapshot[]>;
}
