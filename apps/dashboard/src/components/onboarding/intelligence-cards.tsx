'use client';

import {
  Calendar,
  CloudSun,
  Leaf,
  Satellite,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

import { cn } from '@nertura/ui';

import { getOnboardingCopy } from '@/lib/i18n/onboarding-copy';

interface IntelligenceCard {
  title: string;
  summary: string;
  status: 'ready' | 'placeholder' | 'future';
}

interface IntelligencePreviewCardsProps {
  cards: {
    climate: IntelligenceCard;
    soil: IntelligenceCard;
    diseaseRisk: IntelligenceCard;
    cropCalendar: IntelligenceCard;
    satellite: IntelligenceCard;
  };
  className?: string;
  locale?: 'tr' | 'en';
}

const ICONS = {
  climate: CloudSun,
  soil: Leaf,
  diseaseRisk: ShieldAlert,
  cropCalendar: Calendar,
  satellite: Satellite,
} as const;

export function IntelligencePreviewCards({
  cards,
  className,
  locale = 'tr',
}: IntelligencePreviewCardsProps) {
  const statusCopy = getOnboardingCopy(locale).intelligence.status;
  const statusLabel = {
    ready: { text: statusCopy.ready, className: 'bg-signal/15 text-void' },
    placeholder: { text: statusCopy.placeholder, className: 'bg-muted text-muted-foreground' },
    future: { text: statusCopy.future, className: 'bg-void/5 text-muted-foreground' },
  } as const;

  const entries = [
    { key: 'climate' as const, ...cards.climate },
    { key: 'soil' as const, ...cards.soil },
    { key: 'diseaseRisk' as const, ...cards.diseaseRisk },
    { key: 'cropCalendar' as const, ...cards.cropCalendar },
    { key: 'satellite' as const, ...cards.satellite },
  ];

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {entries.map(({ key, title, summary, status }) => {
        const Icon = ICONS[key];
        const badge = statusLabel[status];
        return (
          <article
            key={key}
            className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/10">
                <Icon className="h-4 w-4 text-signal" aria-hidden />
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                  badge.className
                )}
              >
                {badge.text}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-void">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{summary}</p>
          </article>
        );
      })}
    </div>
  );
}

export function IntelligenceHeroBanner({ locale = 'tr' }: { locale?: 'tr' | 'en' }) {
  const copy = getOnboardingCopy(locale).welcome;
  return (
    <div className="rounded-xl border border-signal/20 bg-signal/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal text-void">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-void">{copy.bannerTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.bannerBody}</p>
        </div>
      </div>
    </div>
  );
}
