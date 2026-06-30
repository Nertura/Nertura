'use client';

import { useEffect, useState } from 'react';

import { detectMarketingLocale, type MarketingLocale } from '@/lib/locale';
import { MARKETING_COPY } from '@/lib/marketing-copy';

export { MARKETING_COPY, GUEST_DISPLAY_ANALYSIS_LIMIT } from '@/lib/marketing-copy';

export function useMarketingLocale(): MarketingLocale {
  const [locale, setLocale] = useState<MarketingLocale>('tr');

  useEffect(() => {
    setLocale(detectMarketingLocale(navigator.language));
  }, []);

  return locale;
}

export function useMarketingCopy() {
  const locale = useMarketingLocale();
  return MARKETING_COPY[locale];
}
