'use client';

import Link from 'next/link';
import { Camera, FileText, MapPin, Plus, X } from 'lucide-react';

import type { EvidenceCard } from '@nertura/types';
import {
  EvidenceCardsPanel,
  cn,
  getDoctorUiCopy,
  type UiLanguage,
} from '@nertura/ui';

interface DoctorIntelligencePanelProps {
  language?: UiLanguage;
  evidenceCards?: EvidenceCard[];
  hasFieldProfile?: boolean;
  onUploadPhoto?: () => void;
  onCreateCase?: () => void;
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function DoctorIntelligencePanel({
  language = 'tr',
  evidenceCards = [],
  hasFieldProfile = false,
  onUploadPhoto,
  onCreateCase,
  className,
  mobileOpen,
  onMobileClose,
}: DoctorIntelligencePanelProps) {
  const copy = getDoctorUiCopy(language).intelligence;
  const similarCards = evidenceCards.filter((c) => c.type === 'similar_cases');
  const mainCards = evidenceCards.filter((c) => c.type !== 'similar_cases');

  const panelBody = (
    <div className="flex flex-col gap-5 p-4">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {copy.evidenceHeading}
        </h2>
        {mainCards.length > 0 ? (
          <EvidenceCardsPanel cards={mainCards} language={language} hideHeading />
        ) : (
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            <p>{copy.noEvidence}</p>
            {!hasFieldProfile ? <p>{copy.noFieldProfile}</p> : null}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {copy.similarCases}
        </h2>
        {similarCards.length > 0 ? (
          <EvidenceCardsPanel cards={similarCards} language={language} hideHeading />
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{copy.noSimilarCases}</p>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {copy.quickActions}
        </h2>
        <div className="mt-2 grid gap-2">
          <button
            type="button"
            onClick={onUploadPhoto}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <Camera className="h-4 w-4 text-primary" aria-hidden />
            {copy.uploadPhoto}
          </button>
          <Link
            href="/farms"
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            {copy.addFieldProfile}
          </Link>
          <button
            type="button"
            onClick={onCreateCase}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 text-primary" aria-hidden />
            {copy.createCase}
          </button>
          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground opacity-80"
            title="Yakında"
          >
            <FileText className="h-4 w-4" aria-hidden />
            {copy.requestReport} · Yakında
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden w-[18rem] shrink-0 flex-col overflow-y-auto border-l border-border/60 bg-muted/10 xl:flex',
          className
        )}
        aria-label={copy.evidenceHeading}
      >
        {panelBody}
      </aside>

      {mobileOpen && onMobileClose && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] xl:hidden"
            aria-label={copy.closePanel}
            onClick={onMobileClose}
          />
          <aside
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,20rem)] flex-col overflow-y-auto border-l bg-card shadow-2xl animate-slide-up xl:hidden"
            aria-label={copy.evidenceHeading}
          >
            <div className="flex h-14 items-center justify-between border-b px-4">
              <p className="font-medium">{copy.evidenceHeading}</p>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                aria-label={copy.closePanel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {panelBody}
          </aside>
        </>
      )}
    </>
  );
}
