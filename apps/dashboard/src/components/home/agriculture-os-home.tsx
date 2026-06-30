import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CloudRain,
  FileText,
  Leaf,
  MapPin,
  Sparkles,
  Stethoscope,
  Upload,
} from 'lucide-react';

import { Button, Card, CardContent, cn } from '@nertura/ui';

import { PremiumReportsPanel } from '@/components/reports/premium-reports-panel';
import { isPremiumReportsEnabled } from '@/lib/credits/premium-reports';
import type { DashboardHomeData } from '@/lib/field-intelligence/home-loader';
import { healthScoreColor } from '@/lib/field-intelligence/health-score';
import {
  formatRelativeDate,
  getDashboardCopy,
  homeGreeting,
  type DashboardLocale,
} from '@/lib/i18n/dashboard-copy';

interface AgricultureOsHomeProps {
  data: DashboardHomeData;
  canWrite: boolean;
  locale?: DashboardLocale;
}

function caseTitle(
  symptom: string | null,
  meta: Record<string, unknown> | undefined,
  locale: DashboardLocale
): string {
  const h = getDashboardCopy(locale).home;
  const crop = meta?.cropLabel as string | undefined;
  if (symptom) return symptom.length > 48 ? `${symptom.slice(0, 48)}…` : symptom;
  if (crop) return `${crop} ${locale === 'tr' ? 'vakası' : 'case'}`;
  return h.fieldCase;
}

function severityClass(severity: string | null): string {
  if (severity === 'high' || severity === 'critical') return 'text-red-600 dark:text-red-400';
  if (severity === 'medium') return 'text-amber-600 dark:text-amber-400';
  return 'text-muted-foreground';
}

export function AgricultureOsHome({ data, canWrite, locale = 'tr' }: AgricultureOsHomeProps) {
  const h = getDashboardCopy(locale).home;
  const status = getDashboardCopy(locale).status;
  const reportsEnabled = isPremiumReportsEnabled();
  const greeting = homeGreeting(locale, data.userFirstName);

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 pb-20 pt-2 lg:px-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-void sm:text-4xl">
          {h.welcome}
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">{h.subtitle}</p>
      </header>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {h.yourFields}
          </h2>
          <Link href="/fields" className="text-xs font-medium text-primary hover:underline">
            {h.viewAll}
          </Link>
        </div>
        {data.fields.length === 0 ? (
          <div className="nertura-empty-state">
            <p className="font-medium text-void">{h.noFieldsTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{h.noFieldsBody}</p>
            {canWrite && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/intake">
                  <Button size="sm">{h.addField}</Button>
                </Link>
                <Link href="/intake">
                  <Button size="sm" variant="outline">
                    {h.describeProblem}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.fields.map((field) => (
              <Link key={field.id} href={`/fields/${field.id}`} className="group block">
                <Card className="h-full border-border/60 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-void group-hover:text-primary">{field.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {field.crop ?? h.noCrop}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-2xl font-semibold tabular-nums', healthScoreColor(field.health.score))}>
                          {field.health.score}
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {field.health.label}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {field.locationLabel ?? field.farmName ?? '—'}
                      </span>
                      <span>{field.areaHa != null ? `${field.areaHa} ha` : h.areaPending}</span>
                      <span>
                        {field.monitoringCases > 0
                          ? h.monitoring(field.monitoringCases)
                          : field.openCases > 0
                            ? h.openCases(field.openCases)
                            : h.healthy}
                      </span>
                      <span>
                        {h.lastAiVisit} ·{' '}
                        {field.lastAiVisit
                          ? formatRelativeDate(field.lastAiVisit, locale)
                          : '—'}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      {h.quickOpen}{' '}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {h.activeCases}
        </h2>
        {data.activeCases.length === 0 ? (
          <Card className="border-dashed border-border/70">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {h.noActiveCases}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.activeCases.map((c) => {
              const meta = (c.intake_metadata ?? {}) as Record<string, unknown>;
              const field = data.fields.find((f) => f.id === c.field_id);
              return (
                <Link
                  key={c.id}
                  href={
                    c.field_id
                      ? `/fields/${c.field_id}?tab=cases&caseId=${c.id}`
                      : `/doctor?caseId=${c.id}`
                  }
                  className="block"
                >
                  <Card className="border-border/60 transition-colors hover:border-primary/25 hover:bg-muted/20">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-void">{caseTitle(c.symptom, meta, locale)}</p>
                        <span
                          className={
                            c.status === 'open' ? 'nertura-status-open' : 'nertura-status-monitoring'
                          }
                        >
                          {c.status === 'open' ? status.open : status.monitoring}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {field?.name ?? h.unlinkedField} ·{' '}
                        {(meta.cropLabel as string) ?? h.cropUnknown}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          {h.updated} {formatRelativeDate(c.updated_at, locale)}
                        </span>
                        <span className={severityClass(c.severity)}>
                          {h.risk} · {c.severity ?? h.assessing}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{h.today}</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/60 lg:col-span-1">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-void">
                <CloudRain className="h-4 w-4 text-sky-500" />
                {h.weather}
              </div>
              <p className="text-sm text-muted-foreground">{h.weatherPlaceholder}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 lg:col-span-1">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-void">
                <Leaf className="h-4 w-4 text-amber-500" />
                {h.diseaseRisk}
              </div>
              <p className="text-sm text-muted-foreground">{h.diseasePlaceholder}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 lg:col-span-1">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-medium text-void">{h.tasksActivity}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{h.reviewCases(data.activeCases.length)}</li>
                <li>{h.checkRecommendations}</li>
                <li>
                  {data.fields.filter((f) => !f.hasBoundary).length > 0
                    ? h.completeBoundaries
                    : h.boundariesUpToDate}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {h.aiRecommendations}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{h.aiRecommendationsSub}</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {data.recommendations.map((rec) => (
            <Card key={rec.id} className="border-border/60">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-void">{rec.title}</p>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {rec.source}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{rec.body}</p>
                {rec.fieldId && (
                  <Link
                    href={`/fields/${rec.fieldId}`}
                    className="inline-flex text-xs font-medium text-primary hover:underline"
                  >
                    {h.openField(rec.fieldName ?? h.openFieldFallback)}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardContent className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Stethoscope className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-widest">{h.askDoctor}</span>
              </div>
              <h2 className="text-2xl font-semibold text-void">{h.askDoctorTitle}</h2>
              <p className="max-w-md text-sm text-muted-foreground">{h.askDoctorBody}</p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Link href="/doctor">
                <Button size="lg" className="w-full sm:w-auto">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {h.openDoctor}
                </Button>
              </Link>
              <div className="flex flex-wrap gap-2">
                <Link href="/doctor">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    {h.uploadPhoto}
                  </Button>
                </Link>
                {data.lastConversationId && (
                  <Link href={`/doctor?conversation=${data.lastConversationId}`}>
                    <Button variant="ghost" size="sm">
                      {h.continueChat}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {h.knowledge}
          </h2>
          <Link href="/knowledge" className="text-xs font-medium text-primary hover:underline">
            {h.browseAll}
          </Link>
        </div>
        <Card className="border-border/60">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-void">{h.knowledgeTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{h.knowledgeBody}</p>
              </div>
            </div>
            <Link href="/knowledge">
              <Button variant="outline" size="sm">
                {h.openKnowledge}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {h.reports}
        </h2>
        {reportsEnabled ? (
          <PremiumReportsPanel />
        ) : (
          <Card className="border-dashed border-border/70">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/60" />
              <p className="font-medium text-void">{h.premiumReports}</p>
              <p className="max-w-sm text-sm text-muted-foreground">{h.premiumLocked}</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
