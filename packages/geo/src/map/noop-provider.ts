import type { LatLng } from '../types';
import type { MapInitOptions, MapInstance, MapProvider } from './types';

class NoopMapInstance implements MapInstance {
  readonly providerId = 'noop';
  private center: LatLng = { lat: 39.93, lng: 32.85 };
  private zoom = 12;

  getCenter(): LatLng {
    return this.center;
  }

  getZoom(): number {
    return this.zoom;
  }

  setCenter(center: LatLng, zoom?: number): void {
    this.center = center;
    if (zoom != null) this.zoom = zoom;
  }

  flyTo(center: LatLng, zoom?: number): void {
    this.setCenter(center, zoom);
  }

  zoomIn(): void {
    this.zoom = Math.min(this.zoom + 1, 20);
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoom - 1, 3);
  }

  fitBounds(): void {
    /* noop */
  }

  addPolygon(): void {
    /* noop */
  }

  updatePolygon(): void {
    /* noop */
  }

  updatePolyline(): void {
    /* noop */
  }

  updatePoints(): void {
    /* noop */
  }

  removeLayer(): void {
    /* noop */
  }

  setGeoJsonLayer(): void {
    /* noop */
  }

  setDrawingEnabled(): void {
    /* noop */
  }

  setPitch(): void {
    /* noop */
  }

  onClick(): () => void {
    return () => undefined;
  }

  resize(): void {
    /* noop */
  }

  destroy(): void {
    /* noop */
  }
}

/** Fallback when no map provider token is configured (dev / tests). */
export class NoopMapProvider implements MapProvider {
  readonly id = 'noop';
  readonly displayName = 'Placeholder';

  isConfigured(): boolean {
    return true;
  }

  async createMap(_container: HTMLElement, options: MapInitOptions = {}): Promise<MapInstance> {
    const instance = new NoopMapInstance();
    if (options.center) instance.setCenter(options.center, options.zoom);
    return instance;
  }
}

export function createNoopMapProvider(): NoopMapProvider {
  return new NoopMapProvider();
}
