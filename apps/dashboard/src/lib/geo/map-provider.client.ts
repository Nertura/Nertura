'use client';

import { useEffect, useMemo } from 'react';

import { createMapboxProvider, createNoopMapProvider } from '@nertura/geo/map';
import type { MapProvider } from '@nertura/geo/map';

import {
  isMapboxTokenConfigured,
  logMapboxTokenDebug,
  readMapboxAccessToken,
} from './map-config';

let cached: MapProvider | null = null;

export function getDashboardMapProvider(): MapProvider {
  if (!cached) {
    const token = readMapboxAccessToken();
    logMapboxTokenDebug('getDashboardMapProvider');
    cached = token
      ? createMapboxProvider({ accessToken: token })
      : createNoopMapProvider();
  }
  return cached;
}

/** Client-only — resolves live map provider (Mapbox vs noop). */
export function useMapConfigured(): boolean {
  const configured = useMemo(() => isMapboxTokenConfigured(), []);

  useEffect(() => {
    logMapboxTokenDebug('useMapConfigured');
  }, []);

  return configured;
}
