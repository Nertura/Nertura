'use client';

import { useMemo } from 'react';

import {
  MapboxForwardGeocodingProvider,
  StubForwardGeocodingProvider,
  type ForwardGeocodingProvider,
} from '@nertura/geo';

import { isMapboxTokenConfigured, readMapboxAccessToken } from './map-config';

let cached: ForwardGeocodingProvider | null = null;

export function getDashboardGeocodingProvider(): ForwardGeocodingProvider {
  if (!cached) {
    const token = readMapboxAccessToken();
    cached = token
      ? new MapboxForwardGeocodingProvider(token)
      : new StubForwardGeocodingProvider();
  }
  return cached;
}

export function useGeocodingConfigured(): boolean {
  return useMemo(() => isMapboxTokenConfigured(), []);
}
