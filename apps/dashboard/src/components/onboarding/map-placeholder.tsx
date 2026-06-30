'use client';

import { MapPin, Pentagon, RotateCcw } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Button, cn } from '@nertura/ui';

import { getOnboardingCopy, type OnboardingLocale } from '@/lib/i18n/onboarding-copy';
import type { BoundaryPolygon } from '@/lib/onboarding/types';

interface MapPlaceholderProps {
  latitude: number | null;
  longitude: number | null;
  onCoordinatesChange: (lat: number, lng: number) => void;
  boundaryGeoJson: BoundaryPolygon | null;
  onBoundaryChange: (boundary: BoundaryPolygon | null) => void;
  className?: string;
  locale?: OnboardingLocale;
}

/** Map-ready UI placeholder — click to pin, draw field polygon. Swap for Mapbox/Google Maps later. */
export function MapPlaceholder({
  latitude,
  longitude,
  onCoordinatesChange,
  boundaryGeoJson,
  onBoundaryChange,
  className,
  locale = 'tr',
}: MapPlaceholderProps) {
  const copy = getOnboardingCopy(locale).map;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [locating, setLocating] = useState(false);

  const lat = latitude ?? 39.9334;
  const lng = longitude ?? 32.8597;

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      if (drawMode) {
        setDrawPoints((pts) => {
          const next = [...pts, { x, y }];
          if (next.length >= 3) {
            const ring = next.map((p) => [
              lng + (p.x / 100 - 0.5) * 0.08,
              lat + (0.5 - p.y / 100) * 0.06,
            ]);
            ring.push(ring[0]!);
            onBoundaryChange({ type: 'Polygon', coordinates: [ring] });
          }
          return next;
        });
        return;
      }

      const newLat = lat + (0.5 - y / 100) * 0.12;
      const newLng = lng + (x / 100 - 0.5) * 0.16;
      onCoordinatesChange(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
    },
    [drawMode, lat, lng, onBoundaryChange, onCoordinatesChange]
  );

  function resetBoundary() {
    setDrawPoints([]);
    onBoundaryChange(null);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCoordinatesChange(
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6))
        );
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  const pinX = 50 + ((lng - (longitude ?? lng)) / 0.16) * 100;
  const pinY = 50 - ((lat - (latitude ?? lat)) / 0.12) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-signal/15 px-2 py-0.5 font-medium text-void">
            {copy.mapReady}
          </span>
          <span>{copy.pinDraw}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locating}
            onClick={useMyLocation}
          >
            <MapPin className="mr-1.5 h-3.5 w-3.5" />
            {copy.useMyLocation}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={drawMode ? 'default' : 'outline'}
            onClick={() => {
              setDrawMode((v) => !v);
              if (drawMode) resetBoundary();
            }}
          >
            <Pentagon className="mr-1.5 h-3.5 w-3.5" />
            {drawMode ? copy.pinMode : copy.drawField}
          </Button>
          {boundaryGeoJson && (
            <Button type="button" size="sm" variant="ghost" onClick={resetBoundary}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div
        ref={canvasRef}
        role="application"
        aria-label={copy.ariaMap}
        tabIndex={0}
        onClick={handleMapClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onCoordinatesChange(lat + 0.001, lng + 0.001);
          }
        }}
        className="relative aspect-[16/10] w-full cursor-crosshair overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-inner dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="absolute left-[12%] top-[20%] h-[28%] w-[35%] rounded-md border border-signal/20 bg-signal/5" />
        <div className="absolute right-[10%] top-[35%] h-[22%] w-[28%] rounded-md border border-signal/15 bg-signal/5" />

        {drawPoints.length > 1 && (
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points={drawPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="rgba(45, 218, 175, 0.2)"
              stroke="rgb(45, 218, 175)"
              strokeWidth="0.5"
            />
          </svg>
        )}

        {!drawMode && latitude != null && longitude != null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${Math.min(95, Math.max(5, pinX))}%`, top: `${Math.min(95, Math.max(5, pinY))}%` }}
          >
            <MapPin className="h-8 w-8 text-signal drop-shadow-md" fill="currentColor" />
          </div>
        )}

        <div className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2 py-1 text-[10px] font-mono text-muted-foreground backdrop-blur">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {drawMode ? copy.drawHelp : copy.pinHelp}
      </p>
    </div>
  );
}
