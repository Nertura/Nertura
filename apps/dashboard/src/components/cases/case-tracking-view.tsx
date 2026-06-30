import Link from 'next/link';
import Image from 'next/image';

import type { CaseOverview, CaseTimelineEvent } from '@nertura/types';
import { Card, CardContent, CardHeader, CardTitle, cn, buttonVariants } from '@nertura/ui';

import { PageHeader } from '@/components/dashboard/page-header';
import { CaseStatusActions } from '@/components/cases/case-status-actions';
import {
  CASE_PROGRESS_LABELS,
  CASE_RISK_LABELS,
  CASE_STATUS_LABELS,
  CASE_TIMELINE_EVENT_LABELS,
} from '@/lib/projects-engine';

interface CaseTaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
}

interface CasePhotoRow {
  id: string;
  url: string | null;
  createdAt: string;
}

interface CaseTrackingViewProps {
  overview: CaseOverview;
  timeline: CaseTimelineEvent[];
  photos: CasePhotoRow[];
  tasks: CaseTaskRow[];
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatConfidence(value: number | null): string {
  if (value == null) return '—';
  return `%${Math.round(value * 100)}`;
}

function doctorHref(conversationId: string | null, caseId: string): string {
  const params = new URLSearchParams();
  params.set('caseId', caseId);
  if (conversationId) params.set('conversation', conversationId);
  return `/doctor?${params.toString()}`;
}

export function CaseTrackingView({ overview, timeline, photos, tasks }: CaseTrackingViewProps) {
  const statusLabel = CASE_STATUS_LABELS[overview.status]?.tr ?? overview.status;
  const progressLabel = CASE_PROGRESS_LABELS[overview.progress]?.tr ?? overview.progress;
  const riskLabel = overview.riskLevel
    ? (CASE_RISK_LABELS[overview.riskLevel] ?? overview.riskLevel)
    : '—';

  const summaryParts = [
    overview.crop ? `Bitki: ${overview.crop}` : null,
    overview.fieldName ? `Tarla: ${overview.fieldName}` : null,
    overview.currentDiagnosis ? overview.currentDiagnosis.slice(0, 160) : null,
  ].filter(Boolean);

  return (
    <div className="p-4 pb-24 lg:p-8">
      <PageHeader
        title="Vaka Takibi"
        description={
          overview.fieldName
            ? `${overview.fieldName}${overview.crop ? ` · ${overview.crop}` : ''}`
            : overview.crop ?? undefined
        }
        action={
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <CaseStatusActions caseId={overview.id} status={overview.status} />
            <Link
              href={doctorHref(overview.conversationId, overview.id)}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              AI Doktor&apos;a Devam Et
            </Link>
          </div>
        }
      />

      <section aria-labelledby="case-summary" className="mb-6">
        <h2 id="case-summary" className="mb-3 text-sm font-semibold text-void">
          Kısa Özet
        </h2>
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Durum</p>
              <p className="mt-1 font-medium text-void">{statusLabel}</p>
              <p className="text-xs text-muted-foreground">{progressLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Risk</p>
              <p className="mt-1 font-medium text-void">{riskLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Güven</p>
              <p className="mt-1 font-medium text-void">{formatConfidence(overview.confidence)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Son aktivite</p>
              <p className="mt-1 text-sm text-void">{formatDate(overview.lastActivityAt)}</p>
            </div>
          </CardContent>
        </Card>
        {summaryParts.length > 0 && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summaryParts.join(' · ')}</p>
        )}
        {overview.nextRecommendation && (
          <p className="mt-2 text-sm text-void">
            <span className="font-medium">Öneri: </span>
            {overview.nextRecommendation}
          </p>
        )}
      </section>

      <section aria-labelledby="case-diagnosis" className="mb-6">
        <h2 id="case-diagnosis" className="mb-3 text-sm font-semibold text-void">
          Son Teşhis
        </h2>
        <Card>
          <CardContent className="pt-6">
            {overview.currentDiagnosis ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-void">
                {overview.currentDiagnosis}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Bu vaka için henüz kayıtlı teşhis yok. AI Doktor ile analiz yapın.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="case-photos" className="mb-6">
        <h2 id="case-photos" className="mb-3 text-sm font-semibold text-void">
          Fotoğraflar
        </h2>
        {photos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Henüz fotoğraf yok. AI Doktor&apos;a fotoğraf yükleyerek vakayı güncelleyin.
            </CardContent>
          </Card>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <li key={photo.id} className="overflow-hidden rounded-lg border bg-card">
                {photo.url ? (
                  <div className="relative aspect-square">
                    <Image
                      src={photo.url}
                      alt="Vaka fotoğrafı"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 200px"
                      unoptimized
                    />
                  </div>
                ) : null}
                <p className="px-2 py-1.5 text-xs text-muted-foreground">{formatDate(photo.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="case-timeline" className="mb-6">
        <h2 id="case-timeline" className="mb-3 text-sm font-semibold text-void">
          Zaman Çizelgesi
        </h2>
        {timeline.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Bu vaka için henüz zaman çizelgesi oluşmadı.
            </CardContent>
          </Card>
        ) : (
          <ol className="space-y-3">
            {timeline.map((event) => (
              <li key={event.id}>
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-medium text-void">
                      {event.title || CASE_TIMELINE_EVENT_LABELS[event.eventType] || event.eventType}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                  </CardHeader>
                  {event.summary ? (
                    <CardContent className="pb-4 pt-0">
                      <p className="text-sm text-muted-foreground">{event.summary}</p>
                    </CardContent>
                  ) : null}
                </Card>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="case-tasks" className="mb-8">
        <h2 id="case-tasks" className="mb-3 text-sm font-semibold text-void">
          Yapılacaklar
        </h2>
        {tasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              AI Doktor takip adımları oluşturduğunda burada görünecek.
            </CardContent>
          </Card>
        ) : (
          <ul className="divide-y rounded-lg border bg-card">
            {tasks.map((task) => (
              <li key={task.id} className="px-4 py-3">
                <p className="font-medium text-void">{task.title}</p>
                {task.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-4 backdrop-blur lg:hidden">
        <Link
          href={doctorHref(overview.conversationId, overview.id)}
          className={cn(buttonVariants(), 'w-full text-center')}
        >
          AI Doktor&apos;a Devam Et
        </Link>
      </div>
    </div>
  );
}
