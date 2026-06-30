import type { ReactNode } from 'react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';

import { Button, Card, CardContent } from '@nertura/ui';

import type { FieldCaseRow } from '@/lib/intake/field-case-service';

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface FieldCaseDetailProps {
  caseId: string;
  canWrite: boolean;
  onUpdated?: (row: FieldCaseRow) => void;
}

export function FieldCaseDetail({ caseId, canWrite, onUpdated }: FieldCaseDetailProps) {
  const [caseRow, setCaseRow] = useState<FieldCaseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/field-cases/${caseId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load case');
      setCaseRow(json.case as FieldCaseRow);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load case');
      setCaseRow(null);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchStatus(action: 'resolve' | 'reopen' | 'monitoring' | 'archive') {
    if (!canWrite || !caseRow) return;
    setSaving(true);
    setError(null);
    try {
      const body =
        action === 'resolve'
          ? { status: 'resolved' }
          : action === 'reopen'
            ? { status: 'open' }
            : action === 'monitoring'
              ? { status: 'monitoring' }
              : { archived: true };

      const res = await fetch(`/api/field-cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Update failed');
      const updated = json.case as FieldCaseRow;
      setCaseRow(updated);
      onUpdated?.(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading case…
        </CardContent>
      </Card>
    );
  }

  if (!caseRow) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {error ?? 'Case not found.'}
        </CardContent>
      </Card>
    );
  }

  const meta = (caseRow.intake_metadata ?? {}) as Record<string, unknown>;
  const archived = Boolean(meta.archived);
  const title = caseRow.symptom ?? (meta.cropLabel as string) ?? 'Field case';

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Patient record
            </p>
            <h2 className="mt-1 text-xl font-semibold text-void">{title}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className={caseRow.status === 'open' ? 'nertura-status-open' : caseRow.status === 'monitoring' ? 'nertura-status-monitoring' : 'nertura-status-resolved'}>
                {archived ? 'archived' : caseRow.status}
              </span>
              {caseRow.severity && (
                <span className="rounded-full bg-muted px-2 py-0.5 capitalize text-muted-foreground">
                  {caseRow.severity} severity
                </span>
              )}
            </div>
          </div>
          {canWrite && (
            <div className="flex flex-wrap gap-2">
              {caseRow.status !== 'resolved' && (
                <Button size="sm" variant="outline" disabled={saving} onClick={() => void patchStatus('resolve')}>
                  Resolve
                </Button>
              )}
              {caseRow.status === 'resolved' && (
                <Button size="sm" variant="outline" disabled={saving} onClick={() => void patchStatus('reopen')}>
                  Reopen
                </Button>
              )}
              {caseRow.status !== 'monitoring' && caseRow.status !== 'resolved' && (
                <Button size="sm" variant="outline" disabled={saving} onClick={() => void patchStatus('monitoring')}>
                  Monitoring
                </Button>
              )}
              {!archived && (
                <Button size="sm" variant="ghost" disabled={saving} onClick={() => void patchStatus('archive')}>
                  Archive
                </Button>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Started" value={formatWhen(caseRow.created_at)} />
          <Field label="Last activity" value={formatWhen(caseRow.updated_at)} />
          <Field label="Next follow-up" value={formatWhen(caseRow.follow_up_date)} />
          <Field label="Crop" value={(meta.cropLabel as string) ?? '—'} />
        </div>

        <Section title="Current recommendation">
          <p className="text-sm text-muted-foreground">
            {caseRow.treatment_plan ??
              caseRow.diagnosis_summary ??
              'No recommendation yet — continue the conversation in AI Doctor.'}
          </p>
        </Section>

        <Section title="Diagnosis">
          <p className="text-sm text-muted-foreground">{caseRow.diagnosis_summary ?? 'Pending diagnosis.'}</p>
        </Section>

        {caseRow.prevention_plan && (
          <Section title="Prevention">
            <p className="text-sm text-muted-foreground">{caseRow.prevention_plan}</p>
          </Section>
        )}

        <Section title="Timeline">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Opened · {formatWhen(caseRow.created_at)}</li>
            {caseRow.diagnosis_summary && <li>Diagnosis recorded · {formatWhen(caseRow.updated_at)}</li>}
            {caseRow.follow_up_date && <li>Follow-up scheduled · {formatWhen(caseRow.follow_up_date)}</li>}
          </ul>
        </Section>

        <Section title="Intake">
          <p className="text-sm text-muted-foreground">{caseRow.raw_intake ?? '—'}</p>
        </Section>

        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Link
            href={`/doctor?fieldId=${caseRow.field_id ?? ''}&caseId=${caseRow.id}${caseRow.raw_intake ? `&q=${encodeURIComponent(caseRow.raw_intake)}` : ''}`}
          >
            <Button size="sm">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Open conversation
            </Button>
          </Link>
          {caseRow.field_id && (
            <Link href={`/fields/${caseRow.field_id}?tab=reports&caseId=${caseRow.id}`}>
              <Button size="sm" variant="outline">
                Premium report
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-void">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
