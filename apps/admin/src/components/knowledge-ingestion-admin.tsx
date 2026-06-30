'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button, cn } from '@nertura/ui';

const TABS = [
  { id: 'sources', label: 'Sources' },
  { id: 'runs', label: 'Runs' },
  { id: 'items', label: 'Collected Items' },
  { id: 'review', label: 'Review Queue' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface IngestionAdminProps {
  initialTab?: TabId;
}

export function KnowledgeIngestionAdmin({ initialTab = 'review' }: IngestionAdminProps) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sources, setSources] = useState<Record<string, unknown>[]>([]);
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([]);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [selectedReview, setSelectedReview] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/knowledge-ingestion/data?tab=${tab}`);
    const json = await res.json();
    if (json.sources) setSources(json.sources);
    if (json.jobs) setJobs(json.jobs);
    if (json.items) setItems(json.items);
    if (json.reviews) setReviews(json.reviews);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runIngestion() {
    setRunning(true);
    setMessage(null);
    const res = await fetch('/api/knowledge-ingestion/run', { method: 'POST', body: '{}' });
    const json = await res.json();
    setRunning(false);
    if (!res.ok) {
      setMessage(json.error ?? 'Run failed');
      return;
    }
    setMessage(
      `Collected ${json.itemsCollected}, queued ${json.itemsQueued}, duplicates ${json.itemsDuplicated}`
    );
    await load();
  }

  async function reviewAction(reviewId: string, action: 'approve' | 'reject' | 'needs_expert') {
    const notes =
      action !== 'approve' ? prompt('Reviewer notes (optional):') ?? undefined : undefined;
    const res = await fetch(`/api/knowledge-ingestion/review/${reviewId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? 'Action failed');
      return;
    }
    setSelectedReview(null);
    await load();
  }

  async function openReview(id: string) {
    const res = await fetch(`/api/knowledge-ingestion/review/${id}`);
    const json = await res.json();
    setSelectedReview(json.review ?? null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-void">Knowledge Ingestion</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Review-first pipeline. Ingested content is never auto-published. All items require
            human approval before entering the Knowledge Bank.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" disabled={running} onClick={runIngestion}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run ingestion
          </Button>
          <Link href="/knowledge">
            <Button type="button" variant="outline">
              Knowledge Bank
            </Button>
          </Link>
        </div>
      </div>

      {message && (
        <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm">{message}</p>
      )}

      <nav className="flex flex-wrap gap-1 border-b pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-signal/10 text-void'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {tab === 'sources' && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Trust</th>
                    <th className="px-3 py-2">Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={String(s.id)} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{String(s.name)}</td>
                      <td className="px-3 py-2">{String(s.type)}</td>
                      <td className="px-3 py-2">{String(s.trust_level)}</td>
                      <td className="px-3 py-2">{s.enabled ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'runs' && (
            <div className="space-y-2">
              {jobs.map((j) => (
                <div key={String(j.id)} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{String(j.status)} · {String(j.trigger_type)}</p>
                  <p className="text-muted-foreground">
                    Collected {String(j.items_collected)} · Queued {String(j.items_queued)} ·{' '}
                    {new Date(String(j.created_at)).toLocaleString()}
                  </p>
                </div>
              ))}
              {!jobs.length && <p className="text-sm text-muted-foreground">No runs yet.</p>}
            </div>
          )}

          {(tab === 'items' || tab === 'approved' || tab === 'rejected') && (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={String(item.id)} className="rounded-lg border p-3">
                  <p className="font-medium">{String(item.title)}</p>
                  <p className="text-xs text-muted-foreground">
                    {String(item.status)} · {String(item.citation ?? '').slice(0, 80)}
                  </p>
                </div>
              ))}
              {!items.length && <p className="text-sm text-muted-foreground">No items.</p>}
            </div>
          )}

          {tab === 'review' && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                {reviews.map((r) => (
                  <button
                    key={String(r.id)}
                    type="button"
                    onClick={() => openReview(String(r.id))}
                    className="w-full rounded-lg border p-3 text-left hover:border-signal/40"
                  >
                    <p className="font-medium">
                      {(r.knowledge_ingestion_items as { title?: string })?.title ?? 'Item'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Risk: {String(r.risk_level)} · {String(r.status)}
                    </p>
                  </button>
                ))}
                {!reviews.length && (
                  <p className="text-sm text-muted-foreground">Review queue empty.</p>
                )}
              </div>

              {selectedReview && (
                <div className="rounded-lg border p-4 text-sm">
                  <h3 className="font-semibold">Review item</h3>
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                    {String(selectedReview.ai_summary ?? '')}
                  </p>
                  <p className="mt-3 text-xs">
                    {(selectedReview.knowledge_ingestion_items as { citation?: string })?.citation}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => reviewAction(String(selectedReview.id), 'approve')}
                    >
                      Approve → KB
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reviewAction(String(selectedReview.id), 'needs_expert')}
                    >
                      Needs expert
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => reviewAction(String(selectedReview.id), 'reject')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
