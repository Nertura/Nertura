import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LegalDocument, LegalLayoutShell } from '@/components/legal/legal-layout';
import { getLegalPage } from '@/lib/legal/content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: 'privacy' },
    { slug: 'terms' },
    { slug: 'cookies' },
    { slug: 'ai-disclaimer' },
    { slug: 'gdpr' },
    { slug: 'kvkk' },
    { slug: 'delete-account' },
    { slug: 'contact' },
    { slug: 'about' },
    { slug: 'agricultural-disclaimer' },
    { slug: 'data-export' },
    { slug: 'photo-consent' },
  ];
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nertura.com';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) return { title: 'Not Found' };
  const url = `${siteUrl}/${slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: 'article',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.description,
    },
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();

  return (
    <LegalLayoutShell currentSlug={slug}>
      <LegalDocument page={page} />
    </LegalLayoutShell>
  );
}
