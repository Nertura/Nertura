import { createMapboxProvider } from './mapbox-provider';
import { createNoopMapProvider } from './noop-provider';
import type { MapProvider } from './types';

export function resolveMapProvider(preferred: 'mapbox' | 'auto' = 'auto'): MapProvider {
  if (preferred === 'mapbox') {
    const mapbox = createMapboxProvider();
    if (mapbox.isConfigured()) return mapbox;
    return createNoopMapProvider();
  }
  const mapbox = createMapboxProvider();
  return mapbox.isConfigured() ? mapbox : createNoopMapProvider();
}

export { createMapboxProvider, MapboxMapProvider } from './mapbox-provider';
export { createNoopMapProvider, NoopMapProvider } from './noop-provider';
export type {
  MapBounds,
  MapInitOptions,
  MapInstance,
  MapProvider,
  MapProviderConfig,
} from './types';
export { DEFAULT_MAP_STYLE, getMapboxAccessToken } from './types';
