import type { ReactNode } from 'react';

import { cn } from '@nertura/ui';

interface GrowthMetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  icon?: ReactNode;
}

export function GrowthMetricCard({
  label,
  value,
  hint,
  trend = 'neutral',
  className,
  icon,
}: GrowthMetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-void">{value}</p>
      {hint ? (
        <p
          className={cn(
            'mt-2 text-xs',
            trend === 'up' && 'text-emerald-600 dark:text-emerald-400',
            trend === 'down' && 'text-amber-600 dark:text-amber-400',
            trend === 'neutral' && 'text-muted-foreground'
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function GrowthSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-void">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function GrowthStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const normalized = status.toLowerCase();
  const styles: Record<string, string> = {
    connected: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    disconnected: 'bg-muted text-muted-foreground',
    error: 'bg-red-500/15 text-red-700 dark:text-red-400',
    disabled: 'bg-muted text-muted-foreground',
    draft: 'bg-muted text-muted-foreground',
    taslak: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
    onaylandi: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    approved: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    sent: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    rejected: 'bg-red-500/15 text-red-700 dark:text-red-400',
    reddedildi: 'bg-red-500/15 text-red-700 dark:text-red-400',
    scheduled: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
    pending_review: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
    delivered: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    bounced: 'bg-red-500/15 text-red-700 dark:text-red-400',
    queued: 'bg-muted text-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize',
        styles[normalized] ?? 'bg-muted text-muted-foreground',
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function GrowthEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="nertura-empty-state rounded-2xl border border-dashed p-12 text-center">
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function GrowthSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/60" />
      ))}
    </div>
  );
}
