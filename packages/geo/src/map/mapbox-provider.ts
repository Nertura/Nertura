import type { FeatureCollection } from 'geojson';
import type mapboxgl from 'mapbox-gl';

import type { LatLng } from '../types';
import type { MapBounds, MapInitOptions, MapInstance, MapProvider, MapProviderConfig } from './types';
import { DEFAULT_MAP_STYLE, getMapboxAccessToken } from './types';

const CLICK_DEBOUNCE_MS = 250;
const DUPLICATE_EPSILON = 1e-7;

function toLatLng(lngLat: mapboxgl.LngLatLike): LatLng {
  if (Array.isArray(lngLat)) {
    return { lng: lngLat[0], lat: lngLat[1] };
  }
  const ll = lngLat as mapboxgl.LngLat;
  return { lng: ll.lng, lat: ll.lat };
}

function isNearDuplicate(a: LatLng, b: LatLng): boolean {
  return Math.abs(a.lng - b.lng) < DUPLICATE_EPSILON && Math.abs(a.lat - b.lat) < DUPLICATE_EPSILON;
}

class MapboxMapInstance implements MapInstance {
  readonly providerId = 'mapbox';
  private clickHandler: ((point: LatLng) => void) | null = null;
  private clickListener: ((e: mapboxgl.MapMouseEvent) => void) | null = null;
  private dragCleanup: (() => void) | null = null;
  private drawingEnabled = false;
  private lastClick: { at: number; point: LatLng } | null = null;

  constructor(private map: mapboxgl.Map) {}

  getCenter(): LatLng {
    const c = this.map.getCenter();
    return { lat: c.lat, lng: c.lng };
  }

  getZoom(): number {
    return this.map.getZoom();
  }

  setCenter(center: LatLng, zoom?: number): void {
    if (zoom != null) {
      this.map.setCenter([center.lng, center.lat]);
      this.map.setZoom(zoom);
    } else {
      this.map.setCenter([center.lng, center.lat]);
    }
  }

  flyTo(center: LatLng, zoom?: number): void {
    this.map.flyTo({
      center: [center.lng, center.lat],
      zoom: zoom ?? this.map.getZoom(),
      essential: true,
    });
  }

  zoomIn(): void {
    this.map.zoomIn({ duration: 250 });
  }

  zoomOut(): void {
    this.map.zoomOut({ duration: 250 });
  }

  fitBounds(bounds: MapBounds, padding = 48): void {
    this.map.fitBounds(
      [
        [bounds.west, bounds.south],
        [bounds.east, bounds.north],
      ],
      { padding, duration: 600 }
    );
  }

  /** Closed polygon ring — requires at least 3 distinct vertices. */
  private ringToGeoJson(coordinates: LatLng[]) {
    if (coordinates.length < 3) return null;
    const ring = coordinates.map((p) => [p.lng, p.lat] as [number, number]);
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
      ring.push(first);
    }
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [ring],
      },
    };
  }

  private lineToGeoJson(coordinates: LatLng[]) {
    if (coordinates.length < 2) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: coordinates.map((p) => [p.lng, p.lat] as [number, number]),
      },
    };
  }

  addPolygon(
    id: string,
    coordinates: LatLng[],
    options?: { fillColor?: string; strokeColor?: string }
  ): void {
    const data = this.ringToGeoJson(coordinates);
    if (!data) return;

    const sourceId = `${id}-source`;
    const fillId = `${id}-fill`;
    const lineId = `${id}-line`;

    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, { type: 'geojson', data });
      this.map.addLayer({
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': options?.fillColor ?? '#22c55e',
          'fill-opacity': 0.25,
        },
      });
      this.map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': options?.strokeColor ?? '#16a34a',
          'line-width': 2,
        },
      });
    } else {
      (this.map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
    }
  }

  updatePolygon(id: string, coordinates: LatLng[]): void {
    this.removePolyline(id);

    const data = this.ringToGeoJson(coordinates);
    if (!data) {
      this.removeLayer(id);
      return;
    }

    const sourceId = `${id}-source`;
    const source = this.map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(data);
    } else {
      this.addPolygon(id, coordinates);
    }
  }

  updatePolyline(
    id: string,
    coordinates: LatLng[],
    options?: { strokeColor?: string }
  ): void {
    const data = this.lineToGeoJson(coordinates);
    if (!data) {
      this.removePolyline(id);
      return;
    }

    const sourceId = `${id}-polyline-source`;
    const lineId = `${id}-polyline-line`;

    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, { type: 'geojson', data });
      this.map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': options?.strokeColor ?? '#eab308',
          'line-width': 2,
          'line-dasharray': [2, 1],
        },
      });
    } else {
      (this.map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
    }
  }

  updatePoints(
    id: string,
    coordinates: LatLng[],
    options?: { color?: string }
  ): void {
    const sourceId = `${id}-points-source`;
    const circleId = `${id}-points-circle`;
    const labelId = `${id}-points-label`;

    if (!coordinates.length) {
      if (this.map.getLayer(labelId)) this.map.removeLayer(labelId);
      if (this.map.getLayer(circleId)) this.map.removeLayer(circleId);
      if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
      return;
    }

    const data = {
      type: 'FeatureCollection' as const,
      features: coordinates.map((p, index) => ({
        type: 'Feature' as const,
        properties: { index: index + 1 },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.lng, p.lat] as [number, number],
        },
      })),
    };

    const color = options?.color ?? '#16a34a';

    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, { type: 'geojson', data });
      this.map.addLayer({
        id: circleId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 12,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': color,
        },
      });
      this.map.addLayer({
        id: labelId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['to-string', ['get', 'index']],
          'text-size': 11,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': color,
        },
      });
    } else {
      (this.map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
    }
  }

  private removePoints(id: string): void {
    const sourceId = `${id}-points-source`;
    const circleId = `${id}-points-circle`;
    const labelId = `${id}-points-label`;
    if (this.map.getLayer(labelId)) this.map.removeLayer(labelId);
    if (this.map.getLayer(circleId)) this.map.removeLayer(circleId);
    if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
  }

  private removePolyline(id: string): void {
    const sourceId = `${id}-polyline-source`;
    const lineId = `${id}-polyline-line`;
    if (this.map.getLayer(lineId)) this.map.removeLayer(lineId);
    if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
  }

  removeLayer(id: string): void {
    const sourceId = `${id}-source`;
    const fillId = `${id}-fill`;
    const lineId = `${id}-line`;
    if (this.map.getLayer(lineId)) this.map.removeLayer(lineId);
    if (this.map.getLayer(fillId)) this.map.removeLayer(fillId);
    if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
    this.removePolyline(id);
    this.removePoints(id);
  }

  setGeoJsonLayer(id: string, data: FeatureCollection): void {
    const sourceId = `${id}-source`;
    const fillId = `${id}-fill`;
    const lineId = `${id}-line`;
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, { type: 'geojson', data });
      this.map.addLayer({
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.2 },
      });
      this.map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: { 'line-color': '#15803d', 'line-width': 2 },
      });
    } else {
      (this.map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
    }
  }

  setDrawingEnabled(enabled: boolean): void {
    if (this.drawingEnabled === enabled) return;
    this.drawingEnabled = enabled;
    if (enabled) {
      this.map.doubleClickZoom.disable();
    } else {
      this.map.doubleClickZoom.enable();
    }
  }

  setPitch(pitch: number): void {
    this.map.easeTo({ pitch, duration: 450 });
  }

  onClick(handler: (point: LatLng) => void): () => void {
    if (this.clickListener) {
      this.map.off('click', this.clickListener);
    }
    if (this.dragCleanup) {
      this.dragCleanup();
      this.dragCleanup = null;
    }

    this.clickHandler = handler;
    this.lastClick = null;

    let dragged = false;
    const onDragStart = () => {
      dragged = true;
    };
    const onDragEnd = () => {
      window.setTimeout(() => {
        dragged = false;
      }, 0);
    };

    this.map.on('dragstart', onDragStart);
    this.map.on('dragend', onDragEnd);
    this.dragCleanup = () => {
      this.map.off('dragstart', onDragStart);
      this.map.off('dragend', onDragEnd);
    };

    this.clickListener = (e) => {
      if (dragged) return;
      if (e.originalEvent?.defaultPrevented) return;

      const point = toLatLng(e.lngLat);
      const now = Date.now();
      if (
        this.lastClick &&
        now - this.lastClick.at < CLICK_DEBOUNCE_MS &&
        isNearDuplicate(this.lastClick.point, point)
      ) {
        return;
      }
      this.lastClick = { at: now, point };
      handler(point);
    };

    this.map.on('click', this.clickListener);

    return () => {
      if (this.clickListener) {
        this.map.off('click', this.clickListener);
        this.clickListener = null;
        this.clickHandler = null;
      }
      if (this.dragCleanup) {
        this.dragCleanup();
        this.dragCleanup = null;
      }
      this.lastClick = null;
    };
  }

  resize(): void {
    this.map.resize();
  }

  destroy(): void {
    if (this.clickListener) {
      this.map.off('click', this.clickListener);
    }
    if (this.dragCleanup) {
      this.dragCleanup();
    }
    if (this.drawingEnabled) {
      this.map.doubleClickZoom.enable();
    }
    this.map.remove();
  }
}

export class MapboxMapProvider implements MapProvider {
  readonly id = 'mapbox';
  readonly displayName = 'Mapbox';

  constructor(private config: MapProviderConfig = {}) {}

  isConfigured(): boolean {
    return Boolean(this.config.accessToken?.trim());
  }

  async createMap(container: HTMLElement, options: MapInitOptions = {}): Promise<MapInstance> {
    if (!this.isConfigured()) {
      throw new Error('Mapbox access token is not configured');
    }
    const mapboxgl = (await import('mapbox-gl')).default;
    mapboxgl.accessToken = this.config.accessToken!;

    const map = new mapboxgl.Map({
      container,
      style: this.config.styleUrl ?? DEFAULT_MAP_STYLE,
      center: options.center
        ? [options.center.lng, options.center.lat]
        : [32.85, 39.93],
      zoom: options.zoom ?? 12,
      minZoom: options.minZoom ?? 3,
      maxZoom: options.maxZoom ?? 20,
      interactive: options.interactive ?? true,
      attributionControl: options.attributionControl ?? true,
    });

    await new Promise<void>((resolve) => {
      if (map.loaded()) resolve();
      else map.once('load', () => resolve());
    });

    return new MapboxMapInstance(map);
  }
}

export function createMapboxProvider(config?: MapProviderConfig): MapboxMapProvider {
  return new MapboxMapProvider({
    accessToken: config?.accessToken ?? getMapboxAccessToken(),
    styleUrl: config?.styleUrl,
  });
}
