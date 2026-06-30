'use client';

import { Loader2, LocateFixed, Minus, Plus } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { LatLng } from '@nertura/geo';
import type { MapBounds, MapInstance, MapProvider } from '@nertura/geo/map';
import { cn } from '../lib/utils';
import { Button } from './button';

export interface MapViewportTarget {
  center?: LatLng;
  zoom?: number;
  bounds?: MapBounds;
  /** Increment to re-apply the same target (e.g. repeat search). */
  token?: number;
}

export interface MapViewLabels {
  loading?: string;
  loadFailed?: string;
  tokenHint?: string;
  layerHint?: string;
  zoomIn?: string;
  zoomOut?: string;
  myLocation?: string;
  ariaMap?: string;
  geoUnsupported?: string;
  geoDenied?: string;
  geoFailed?: string;
}

export interface MapViewProps {
  provider: MapProvider;
  className?: string;
  center?: LatLng;
  zoom?: number;
  /** Fly/fit when target changes (location search, confirm area). */
  viewTarget?: MapViewportTarget | null;
  /** Existing field polygons keyed by id */
  polygons?: Record<string, { coordinates: LatLng[]; label?: string }>;
  /** Open line previews for in-progress drawing (2 points) */
  polylines?: Record<string, { coordinates: LatLng[]; label?: string }>;
  /** Click-to-draw vertex markers */
  points?: LatLng[];
  /** Enable click-to-add drawing vertices */
  drawingMode?: boolean;
  onMapClick?: (point: LatLng) => void;
  onMapReady?: (map: MapInstance) => void;
  onGeolocation?: (point: LatLng) => void;
  /** Hide default "layers coming soon" chip */
  hideLayerHint?: boolean;
  /** Slot for future layer controls (weather, soil, satellite) */
  layerControls?: ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  /** Localized control and status strings */
  labels?: MapViewLabels;
  /** Use info styling for geolocation messages (permission denied, etc.) */
  geoErrorVariant?: 'destructive' | 'info';
}

export function MapView({
  provider,
  className,
  center,
  zoom = 14,
  viewTarget,
  polygons,
  polylines,
  points,
  drawingMode = false,
  onMapClick,
  onMapReady,
  onGeolocation,
  hideLayerHint = false,
  layerControls,
  emptyMessage = 'Map unavailable — configure a map provider token.',
  errorMessage,
  labels,
  geoErrorVariant = 'info',
}: MapViewProps) {
  const L = {
    loading: labels?.loading ?? 'Loading map…',
    loadFailed: labels?.loadFailed ?? 'Failed to load map.',
    tokenHint: labels?.tokenHint ?? 'Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to enable.',
    layerHint: labels?.layerHint ?? 'Layers: weather · soil · satellite (coming soon)',
    zoomIn: labels?.zoomIn ?? 'Zoom in',
    zoomOut: labels?.zoomOut ?? 'Zoom out',
    myLocation: labels?.myLocation ?? 'Go to current location',
    ariaMap: labels?.ariaMap ?? 'Interactive farm map',
    geoUnsupported: labels?.geoUnsupported ?? 'Geolocation is not supported in this browser.',
    geoDenied:
      labels?.geoDenied ??
      'Location permission denied. Enable it in browser settings.',
    geoFailed: labels?.geoFailed ?? 'Could not retrieve your location.',
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const prevPolygonIdsRef = useRef<Set<string>>(new Set());
  const prevPolylineIdsRef = useRef<Set<string>>(new Set());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unconfigured'>('loading');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const mapId = useId();

  onMapClickRef.current = onMapClick;

  useEffect(() => {
    let cancelled = false;
    let instance: MapInstance | null = null;

    async function init() {
      if (!containerRef.current) return;
      if (!provider?.isConfigured?.()) {
        setStatus('unconfigured');
        return;
      }
      setStatus('loading');
      try {
        instance = await provider.createMap(containerRef.current, { center, zoom });
        if (cancelled) {
          instance.destroy();
          return;
        }
        mapRef.current = instance;
        onMapReady?.(instance);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    void init();

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per provider
  }, [provider]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    if (center) map.setCenter(center, zoom);
  }, [center, zoom, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready' || !viewTarget) return;
    if (viewTarget.bounds) {
      map.fitBounds(viewTarget.bounds);
    } else if (viewTarget.center) {
      map.flyTo(viewTarget.center, viewTarget.zoom ?? 14);
    }
  }, [viewTarget, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const current = new Set(Object.keys(polygons ?? {}));
    for (const id of prevPolygonIdsRef.current) {
      if (!current.has(id)) map.removeLayer(id);
    }
    prevPolygonIdsRef.current = current;
    Object.entries(polygons ?? {}).forEach(([id, poly]) => {
      map.updatePolygon(id, poly.coordinates);
    });
  }, [polygons, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const current = new Set(Object.keys(polylines ?? {}));
    for (const id of prevPolylineIdsRef.current) {
      if (!current.has(id)) map.removeLayer(id);
    }
    prevPolylineIdsRef.current = current;
    Object.entries(polylines ?? {}).forEach(([id, line]) => {
      map.updatePolyline(id, line.coordinates);
    });
  }, [polylines, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    map.updatePoints('draft-vertices', points ?? [], { color: '#16a34a' });
  }, [points, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    map.setDrawingEnabled(drawingMode);
    return () => map.setDrawingEnabled(false);
  }, [drawingMode, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready' || !drawingMode) return;
    const handler = (point: LatLng) => onMapClickRef.current?.(point);
    return map.onClick(handler);
  }, [drawingMode, status]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError(L.geoUnsupported);
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current?.flyTo(point, Math.max(mapRef.current.getZoom(), 15));
        onGeolocation?.(point);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(L.geoDenied);
        } else {
          setGeoError(L.geoFailed);
        }
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  }, [L.geoDenied, L.geoFailed, L.geoUnsupported, onGeolocation]);

  const showPlaceholder = status === 'unconfigured' || status === 'error';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-muted/30',
        className
      )}
      data-map-id={mapId}
    >
      <div
        ref={containerRef}
        className={cn('h-full min-h-[280px] w-full', showPlaceholder && 'opacity-0')}
        role="application"
        aria-label={L.ariaMap}
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80 text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
          <span>{L.loading}</span>
        </div>
      )}

      {status === 'unconfigured' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-950/90 to-emerald-900/70 p-6 text-center text-sm text-emerald-50">
          <p>{emptyMessage}</p>
          <p className="text-xs text-emerald-100/80">{L.tokenHint}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 p-6 text-center text-sm text-destructive">
          {errorMessage ?? L.loadFailed}
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2">
            {layerControls ? (
              <div className="pointer-events-auto rounded-lg border border-border/60 bg-background/95 p-2 shadow-sm backdrop-blur">
                {layerControls}
              </div>
            ) : !hideLayerHint ? (
              <div className="pointer-events-auto rounded-lg border border-dashed border-border/60 bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
                {L.layerHint}
              </div>
            ) : null}
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 w-9 shadow-md"
              onClick={handleZoomIn}
              aria-label={L.zoomIn}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 w-9 shadow-md"
              onClick={handleZoomOut}
              aria-label={L.zoomOut}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 w-9 shadow-md"
              onClick={handleGeolocation}
              disabled={geoLoading}
              aria-label={L.myLocation}
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}

      {geoError && (
        <div
          className={cn(
            'absolute bottom-3 left-3 right-16 z-10 rounded-lg px-3 py-2.5 text-xs shadow-sm backdrop-blur',
            geoErrorVariant === 'info'
              ? 'border border-border/80 bg-background/95 text-muted-foreground'
              : 'border border-destructive/30 bg-background/95 text-destructive'
          )}
        >
          {geoError}
        </div>
      )}
    </div>
  );
}
