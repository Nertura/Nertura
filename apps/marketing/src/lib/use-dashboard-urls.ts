'use client';

import { useLayoutEffect, useMemo, useState } from 'react';

import {
  type DashboardUrlParams,
  getBrowserDashboardContext,
  getDashboardBaseUrl,
  getDashboardDoctorUrl,
  getDashboardLoginUrl,
  getDashboardRegisterUrl,
} from '@/lib/app-urls';

export type DashboardUrls = {
  ready: boolean;
  base: string;
  login: string;
  register: string;
  doctor: string;
};

const PLACEHOLDER: Omit<DashboardUrls, 'ready'> = {
  base: '#',
  login: '#',
  register: '#',
  doctor: '#',
};

function buildUrls(
  params: DashboardUrlParams | undefined,
  context: ReturnType<typeof getBrowserDashboardContext>
) {
  return {
    base: getDashboardBaseUrl(context),
    login: getDashboardLoginUrl(params, context),
    register: getDashboardRegisterUrl(params, context),
    doctor: getDashboardDoctorUrl(params, context),
  };
}

/**
 * Client-only dashboard URLs — waits for mount so href never leaks SSR localhost on LAN.
 */
export function useDashboardUrls(params?: DashboardUrlParams): DashboardUrls {
  const [ready, setReady] = useState(false);
  const paramKey = useMemo(
    () =>
      JSON.stringify({
        next: params?.next,
        q: params?.q,
        intent: params?.intent,
        source: params?.source,
        conversation: params?.conversation,
        caseId: params?.caseId,
      }),
    [
      params?.next,
      params?.q,
      params?.intent,
      params?.source,
      params?.conversation,
      params?.caseId,
    ]
  );
  const parsedParams = useMemo(
    () => (paramKey ? (JSON.parse(paramKey) as DashboardUrlParams) : undefined),
    [paramKey]
  );

  const [urls, setUrls] = useState(() => {
    if (typeof window === 'undefined') return PLACEHOLDER;
    return buildUrls(parsedParams, getBrowserDashboardContext());
  });

  useLayoutEffect(() => {
    const context = getBrowserDashboardContext();
    setUrls(buildUrls(parsedParams, context));
    setReady(true);
  }, [parsedParams]);

  return { ready, ...urls };
}
