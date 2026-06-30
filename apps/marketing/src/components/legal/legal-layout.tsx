import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@nertura/ui';

import { LEGAL_NAV, type LegalPageContent } from '@/lib/legal/content';

interface LegalDocumentProps {
  page: LegalPageContent;
}

export function LegalDocument({ page }: LegalDocumentProps) {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <header className="not-prose mb-10 border-b pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-void">{page.title}</h1>
        <p className="mt-2 text-muted-foreground">{page.description}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Belge sürümü: {page.version} · Son güncelleme:{' '}
          {new Date(page.lastUpdated).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">İletişim: privacy@nertura.com</p>
      </header>

      <div className="space-y-10">
        {page.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-void">{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {section.list.map((item) => (
                  <li key={item.slice(0, 40)}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

export function LegalLayoutShell({
  children,
  currentSlug,
}: {
  children: ReactNode;
  currentSlug?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-signal text-sm font-bold text-void">
              N
            </span>
            <span className="font-semibold text-void">Nertura</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr] lg:gap-12 lg:px-6">
        <nav
          className="hidden lg:block"
          aria-label="Yasal belgeler"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Yasal
          </p>
          <ul className="space-y-1">
            {LEGAL_NAV.map(({ slug, title }) => (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm transition-colors',
                    currentSlug === slug
                      ? 'bg-signal/10 font-medium text-void'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  aria-current={currentSlug === slug ? 'page' : undefined}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main-content" className="min-w-0">
          {children}

          <nav className="mt-12 border-t pt-8 lg:hidden" aria-label="Yasal belgeler mobil">
            <p className="mb-3 text-sm font-medium text-void">Diğer yasal sayfalar</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {LEGAL_NAV.filter((p) => p.slug !== currentSlug).map(({ slug, title }) => (
                <li key={slug}>
                  <Link
                    href={`/${slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </main>
      </div>
    </div>
  );
}
