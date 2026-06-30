'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Loader2, RefreshCw } from 'lucide-react';

import { Button, cn } from '@nertura/ui';

import {
  getDashboardCopy,
  formatRelativeDate,
  type DashboardLocale,
} from '@/lib/i18n/dashboard-copy';
import type { FieldCaseRow } from '@/lib/intake/field-case-service';

type CaseStatus = 'open' | 'monitoring' | 'resolved';

function StatusBadge({
  status,
  locale,
}: {
  status: CaseStatus;
  locale: DashboardLocale;
}) {
  const label = getDashboardCopy(locale).status[status];
  const cls =
    status === 'open'
      ? 'nertura-status-open'
      : status === 'monitoring'
        ? 'nertura-status-monitoring'
        : 'nertura-status-resolved';
  return <span className={cls}>{label}</span>;
}

interface FieldCasesPanelProps {
  selectedFieldId?: string | null;
  activeCaseId?: string | null;
  onSelectCase?: (caseRow: FieldCaseRow) => void;
  className?: string;
  locale?: DashboardLocale;
}

export function FieldCasesPanel({
  selectedFieldId,
  activeCaseId,
  onSelectCase,
  className,
  locale = 'tr',
}: FieldCasesPanelProps) {
  const copy = getDashboardCopy(locale);
  const fc = copy.fieldCases;
  const statusTabs = useMemo(
    (): Array<{ id: CaseStatus; label: string }> => [
      { id: 'open', label: copy.status.open },
      { id: 'monitoring', label: copy.status.monitoring },
      { id: 'resolved', label: copy.status.resolved },
    ],
    [copy.status]
  );

  const [statusTab, setStatusTab] = useState<CaseStatus>('open');
  const [filterByField, setFilterByField] = useState(false);
  const [cases, setCases] = useState<FieldCaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const emptyMessage =
    statusTab === 'open'
      ? fc.emptyOpen
      : statusTab === 'monitoring'
        ? fc.emptyMonitoring
        : fc.emptyResolved;

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('status', statusTab);
      if (filterByField && selectedFieldId) params.set('fieldId', selectedFieldId);
      const res = await fetch(`/api/field-cases?${params.toString()}`);
      const json = await res.json();
      if (res.ok) setCases(json.cases ?? []);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [statusTab, filterByField, selectedFieldId]);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (selectedFieldId) setFilterByField(true);
  }, [selectedFieldId]);

  return (
    <div className={cn('rounded-xl border bg-card shadow-sm', className)}>
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" aria-hidden />
          <p className="text-sm font-medium">{fc.title}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => void loadCases()}
          aria-label={copy.common.refresh}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </Button>
      </div>

      <p className="border-b px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        {fc.hint}
      </p>

      <div className="flex gap-1 border-b p-2" role="tablist" aria-label={fc.statusTabsAria}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={statusTab === tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
              statusTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedFieldId && (
        <label className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={filterByField}
            onChange={(e) => setFilterByField(e.target.checked)}
            className="rounded border-input accent-primary"
          />
          {fc.onlySelectedField}
        </label>
      )}

      <div className="max-h-64 overflow-y-auto p-2">
        {loading && (
          <p className="flex items-center gap-2 px-2 py-4 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            {fc.loading}
          </p>
        )}
        {!loading && cases.length === 0 && (
          <div className="nertura-empty-state mx-1 my-2 py-6">
            <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
            <p className="mt-1 text-xs text-muted-foreground">{fc.emptyHint}</p>
            <Link
              href="/intake"
              className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
            >
              {fc.startIntake}
            </Link>
          </div>
        )}
        <ul className="space-y-1.5">
          {cases.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelectCase?.(c)}
                className={cn(
                  'w-full rounded-lg border px-2.5 py-2.5 text-left text-xs transition-all hover:border-primary/30 hover:shadow-sm',
                  activeCaseId === c.id
                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                    : 'border-transparent bg-muted/30'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={c.status as CaseStatus} locale={locale} />
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeDate(c.updated_at, locale)}
                  </span>
                </div>
                <span className="mt-1.5 line-clamp-2 block font-medium text-foreground">
                  {c.symptom ?? c.raw_intake ?? fc.fallbackTitle}
                </span>
                {c.diagnosis_summary && (
                  <span className="mt-1 line-clamp-1 block text-[10px] text-muted-foreground">
                    {fc.lastPrefix} {c.diagnosis_summary}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
