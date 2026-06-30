'use client';

import { CookieConsentBanner, ThemeProvider } from '@nertura/ui';
import type { ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';

import { getBrowserDashboardContext, getMarketingBaseUrl } from '@nertura/utils';

export function DashboardProviders({ children }: { children: ReactNode }) {
  const [siteUrl, setSiteUrl] = useState('https://nertura.com');

  useLayoutEffect(() => {
    setSiteUrl(getMarketingBaseUrl(getBrowserDashboardContext()));
  }, []);

  return (
    <ThemeProvider>
      {children}
      <CookieConsentBanner
        legalLinks={{
          privacy: `${siteUrl}/privacy`,
          kvkk: `${siteUrl}/kvkk`,
          cookies: `${siteUrl}/cookies`,
        }}
      />
    </ThemeProvider>
  );
}
