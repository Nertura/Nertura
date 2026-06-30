'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  Activity,
  Clock,
  FileText,
  History,
  Map,
  Settings,
  Stethoscope,
} from 'lucide-react';

import { Button, Card, CardContent, cn } from '@nertura/ui';

import { PremiumReportsPanel } from '@/components/reports/premium-reports-panel';
import { FIELD_COPY } from '@/lib/i18n/field-copy';
import { getDashboardCopy } from '@/lib/i18n/dashboard-copy';
import type { FieldCaseRow } from '@/lib/intake/field-case-service';
import { fieldDisplayLocation, type FieldWorkspaceData } from '@/lib/field-intelligence/field-workspace-loader';
import { healthScoreColor } from '@/lib/field-intelligence/health-score';

import { FieldCaseDetail } from './field-case-detail';

const W = FIELD_COPY.workspace;

const TABS = [
  { id: 'overview', label: W.tabs.overview, icon: Activity },
  { id: 'doctor', label: W.tabs.doctor, icon: Stethoscope },
  { id: 'cases', label: W.tabs.cases, icon: FileText },
  { id: 'timeline', label: W.tabs.timeline, icon: Clock },
  { id: 'reports', label: W.tabs.reports, icon: FileText },
  { id: 'history', label: W.tabs.history, icon: History },
  { id: 'boundary', label: W.tabs.boundary, icon: Map },
  { id: 'settings', label: W.tabs.settings, icon: Settings },
] as const;

type TabId = (typeof TABS)[number]['id'];

function formatWhen(iso: string | null): string {
  if (!iso) return W.stats.notRecorded;
  return new Date(iso).toLocaleDateString('tr-TR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface FieldWorkspaceProps {
  data: FieldWorkspaceData;
}

export function FieldWorkspace({ data }: FieldWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as TabId | null) ?? 'overview';
  const caseId = searchParams.get('caseId');

  const [cases, setCases] = useState<FieldCaseRow[]>(data.cases);

  const activeCases = useMemo(
    () => cases.filter((c) => c.status === 'open' || c.status === 'monitoring'),
    [cases]
  );

  const setTab = useCallback(
    (next: TabId, extra?: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', next);
      if (extra) {
        for (const [k, v] of Object.entries(extra)) {
          if (v) params.set(k, v);
          else params.delete(k);
        }
      }
      router.push(`/fields/${data.fieldId}?${params.toString()}`);
    },
    [data.fieldId, router, searchParams]
  );

  const handleCaseUpdated = (updated: FieldCaseRow) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const location = fieldDisplayLocation(data);

  return (
    <div className="space-y-8 px-4 pb-16 lg:px-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {W.eyebrow}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-void">{data.fieldName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.farmName ? `${data.farmName} · ` : ''}
              {location}
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-5 py-3">
            <div>
              <p className={cn('text-3xl font-semibold tabular-nums', healthScoreColor(data.health.score))}>
                {data.health.score}
              </p>
              <p className="text-xs text-muted-foreground">{data.health.label}</p>
            </div>
            <p className="max-w-[160px] text-xs text-muted-foreground">{data.health.hint}</p>
          </div>
        </div>

        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            if (id === 'doctor') {
              return (
                <Link
                  key={id}
                  href={`/doctor?fieldId=${data.fieldId}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            }
            if (id === 'boundary') {
              return (
                <Link
                  key={id}
                  href={`/farms/${data.farmId}/map?field=${data.fieldId}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            }
            if (id === 'settings') {
              return (
                <Link
                  key={id}
                  href={`/fields/${data.fieldId}/edit`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            }
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id, id === 'cases' ? {} : { caseId: null })}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  tab === id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>
      </header>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 lg:col-span-2">
            <CardContent className="p-0">
              <div className="flex aspect-[16/7] items-center justify-center rounded-t-lg bg-gradient-to-br from-emerald-50/80 to-muted/40 dark:from-emerald-950/20">
                <p className="text-sm text-muted-foreground">{W.imageryPlaceholder}</p>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <Stat label={W.stats.crop} value={data.crop ?? W.stats.notAssigned} />
                <Stat label={W.stats.area} value={data.areaHa != null ? `${data.areaHa} ha` : '—'} />
                <Stat label={W.stats.location} value={location} />
                <Stat label={W.stats.soil} value={data.soilType ?? '—'} />
                <Stat label={W.stats.lastDiagnosis} value={data.lastDiagnosis ?? W.stats.noneYet} />
                <Stat label={W.stats.diagnosed} value={formatWhen(data.lastDiagnosisAt)} />
                <Stat label={W.stats.lastIrrigation} value={data.lastIrrigation ?? W.stats.irrigationPlaceholder} />
                <Stat label={W.stats.lastFertilizer} value={data.lastFertilizer ?? W.stats.fertilizerPlaceholder} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border/60">
              <CardContent className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {W.upcomingRecommendations}
                </p>
                {data.recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{W.recommendationsEmpty}</p>
                ) : (
                  <ul className="space-y-3">
                    {data.recommendations.map((r) => (
                      <li key={r.id} className="text-sm">
                        <p className="font-medium text-void">{r.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{r.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Link href={`/doctor?fieldId=${data.fieldId}`}>
              <Button className="w-full">
                <Stethoscope className="mr-2 h-4 w-4" />
                {W.openDoctorField}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {tab === 'cases' && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {W.patientRecords}
            </p>
            {cases.length === 0 ? (
              <div className="nertura-empty-state">
                <p className="font-medium">{W.noCasesField}</p>
                <Link href={`/doctor?fieldId=${data.fieldId}`} className="mt-3 inline-block">
                  <Button size="sm">{W.startWithDoctor}</Button>
                </Link>
              </div>
            ) : (
              cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTab('cases', { caseId: c.id })}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-colors',
                    caseId === c.id
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/60 hover:border-primary/20 hover:bg-muted/20'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-void">{c.symptom ?? W.caseFallback}</p>
                    <CaseStatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatWhen(c.created_at)} · {c.severity ?? W.severityPending}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="lg:col-span-3">
            {caseId ? (
              <FieldCaseDetail
                caseId={caseId}
                canWrite={data.canWrite}
                onUpdated={handleCaseUpdated}
              />
            ) : (
              <Card className="border-dashed border-border/70">
                <CardContent className="py-16 text-center text-sm text-muted-foreground">
                  {W.selectCase}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <Card className="border-border/60">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">{W.timelineIntro}</p>
            <ul className="space-y-3 border-l-2 border-border/80 pl-4">
              {cases.slice(0, 8).map((c) => (
                <li key={c.id} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary/60" />
                  <p className="font-medium text-void">{c.symptom ?? W.caseOpened}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(c.updated_at)} · {c.status}
                    {c.diagnosis_summary ? ` · ${W.diagnosisRecorded}` : ''}
                  </p>
                </li>
              ))}
              {cases.length === 0 && (
                <li className="text-sm text-muted-foreground">{W.noEventsYet}</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {tab === 'reports' && (
        <div className="max-w-xl">
          <PremiumReportsPanel fieldId={data.fieldId} />
        </div>
      )}

      {tab === 'history' && (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-void">{W.conversationHistory}</p>
              <p className="mt-1 text-sm text-muted-foreground">{W.conversationHistoryHint}</p>
            </div>
            <Link href="/history">
              <Button variant="outline">{W.openHistory}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {activeCases.length > 0 && tab === 'overview' && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {W.activeCasesField}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeCases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setTab('cases', { caseId: c.id })}
                className="rounded-xl border border-border/60 p-4 text-left hover:border-primary/25"
              >
                <p className="font-medium">{c.symptom ?? W.caseGeneric}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.status} · {c.severity ?? '—'}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-void">{value}</p>
    </div>
  );
}

function CaseStatusBadge({ status }: { status: FieldCaseRow['status'] }) {
  const label = getDashboardCopy('tr').status[status];
  const cls =
    status === 'open'
      ? 'nertura-status-open'
      : status === 'monitoring'
        ? 'nertura-status-monitoring'
        : 'nertura-status-resolved';
  return <span className={cls}>{label}</span>;
}
