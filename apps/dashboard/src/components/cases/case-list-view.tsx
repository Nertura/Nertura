'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { Card, CardContent, cn, buttonVariants } from '@nertura/ui';

import { PageHeader } from '@/components/dashboard/page-header';
import type { CaseListFilter, CaseListItem } from '@/lib/projects-engine';
import {
  CASE_PROGRESS_LABELS,
  CASE_RISK_LABELS,
  CASE_STATUS_LABELS,
} from '@/lib/projects-engine';

const FILTERS: { id: CaseListFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'open', label: 'Açık' },
  { id: 'monitoring', label: 'Takipte' },
  { id: 'resolved', label: 'Çözüldü' },
];

interface CaseListViewProps {
  cases: CaseListItem[];
  initialFilter: CaseListFilter;
  initialSearch: string;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function doctorHref(item: CaseListItem): string {
  const params = new URLSearchParams();
  params.set('caseId', item.id);
  if (item.conversationId) params.set('conversation', item.conversationId);
  return `/doctor?${params.toString()}`;
}

export function CaseListView({ cases, initialFilter, initialSearch }: CaseListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setFilter = useCallback(
    (filter: CaseListFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (filter === 'all') params.delete('filter');
      else params.set('filter', filter);
      startTransition(() => router.push(`/cases?${params.toString()}`));
    },
    [router, searchParams]
  );

  const onSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set('q', trimmed);
      else params.delete('q');
      startTransition(() => router.push(`/cases?${params.toString()}`));
    },
    [router, searchParams]
  );

  return (
    <div className="p-4 pb-24 lg:p-8">
      <PageHeader
        title="Vaka Takibi"
        description="Bitki, tarla ve ürün sorunlarınızı burada takip edin."
      />

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors',
                initialFilter === f.id
                  ? 'border-signal bg-signal/10 text-void'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          defaultValue={initialSearch}
          placeholder="Ürün, teşhis veya tarla ara"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch((e.target as HTMLInputElement).value);
          }}
        />
      </div>

      {cases.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Henüz takip edilen vaka yok.
              <br />
              AI Doktor&apos;a bir bitki veya tarla sorunu anlatarak başlayın.
            </p>
            <Link href="/doctor" className={cn(buttonVariants(), 'text-sm')}>
              AI Doktor&apos;a Git
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', pending && 'opacity-70')}>
          {cases.map((item) => {
            const statusLabel = CASE_STATUS_LABELS[item.status]?.tr ?? item.status;
            const progressLabel = CASE_PROGRESS_LABELS[item.progress as keyof typeof CASE_PROGRESS_LABELS]?.tr ?? item.progress;
            const riskLabel = item.riskLevel
              ? (CASE_RISK_LABELS[item.riskLevel] ?? item.riskLevel)
              : null;

            return (
              <li key={item.id}>
                <Card className="h-full overflow-hidden">
                  {item.thumbnailUrl ? (
                    <div className="relative aspect-[16/9] border-b bg-muted">
                      <Image
                        src={item.thumbnailUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <CardContent className="flex h-full flex-col gap-3 pt-4">
                    <div>
                      <p className="font-medium text-void">
                        {item.cropLabel ?? item.diagnosisSummary?.slice(0, 48) ?? 'Vaka'}
                      </p>
                      {item.fieldName ? (
                        <p className="text-xs text-muted-foreground">{item.fieldName}</p>
                      ) : null}
                    </div>
                    {item.diagnosisSummary ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.diagnosisSummary}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{statusLabel}</span>
                      <span>·</span>
                      <span>{progressLabel}</span>
                      {riskLabel ? (
                        <>
                          <span>·</span>
                          <span>Risk: {riskLabel}</span>
                        </>
                      ) : null}
                      {item.confidence != null ? (
                        <>
                          <span>·</span>
                          <span>Güven: %{Math.round(item.confidence * 100)}</span>
                        </>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Son aktivite: {formatDate(item.lastActivityAt)}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      <Link
                        href={`/cases/${item.id}`}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                      >
                        Vaka Detayını Aç
                      </Link>
                      <Link
                        href={doctorHref(item)}
                        className={cn(buttonVariants({ size: 'sm' }))}
                      >
                        AI Doktor&apos;a Devam Et
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
