import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { SkipLink } from '@nertura/ui';

import { MarketingProviders } from '@/components/marketing-providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nertura.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Nertura — AI Tarım Doktoru',
    template: '%s | Nertura',
  },
  description:
    'Yapay zekâ destekli tarım danışmanı. Bitki hastalığı teşhisi, tarla ve ürün analizi — domates, buğday, zeytin, üzüm, narenciye.',
  keywords: [
    'AI agriculture',
    'AI plant doctor',
    'plant disease detection',
    'crop diagnosis',
    'smart farming AI',
    'farm intelligence',
    'agriculture AI',
    'plant doctor',
    'tarım yapay zeka',
    'bitki hastalığı teşhis',
    'akıllı tarım',
    'bitki doktoru',
  ],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    url: siteUrl,
    siteName: 'Nertura',
    title: 'Nertura — The AI Agriculture Doctor',
    description:
      'Plant diseases, fertilizers, soil, irrigation, pests and crop guidance powered by AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nertura — The AI Agriculture Doctor',
    description:
      'Bitkileriniz hakkında soru sorun. Fotoğraf yükleyerek AI tarım teşhisi alın.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'tr-TR': siteUrl,
      'en-US': `${siteUrl}/en`,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Nertura',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'AI Agriculture Doctor for plant health, crop guidance, and agricultural care worldwide.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Nertura?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nertura is an AI Agriculture Doctor that helps you diagnose plant problems and get crop care guidance.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I upload plant photos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Upload JPG, PNG, or WebP photos for AI vision analysis and treatment recommendations.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <MarketingProviders>
          <SkipLink />
          {children}
        </MarketingProviders>
      </body>
    </html>
  );
}
