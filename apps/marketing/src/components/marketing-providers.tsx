'use client';

import { CookieConsentBanner, ThemeProvider } from '@nertura/ui';
import type { ReactNode } from 'react';

export function MarketingProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <CookieConsentBanner
        legalLinks={{
          privacy: '/privacy',
          kvkk: '/kvkk',
          cookies: '/cookies',
        }}
      />
    </ThemeProvider>
  );
}
