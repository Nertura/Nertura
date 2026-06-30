import type { MetadataRoute } from 'next';

import { LEGAL_PAGES } from '@/lib/legal/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nertura.com';
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...LEGAL_PAGES.map((page) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: new Date(page.lastUpdated),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
