'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Loader2, Search, Sparkles } from 'lucide-react';

import { Button, Input, Label, buttonVariants } from '@nertura/ui';

import { AdminDataList } from '@/components/admin-data-list';
import { GrowthEmptyState, GrowthStatusBadge } from '@/components/growth/growth-ui';
import { LEAD_DISCOVERY_CATEGORIES } from '@/lib/growth/discovery-categories';
import type { ExtendedLead } from '@/lib/growth/leads';

export function LeadDiscoveryClient({ initialLeads }: { initialLeads: ExtendedLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [sector, setSector] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const runDiscovery = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/growth/leads/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: sector.trim() || undefined,
          category: category ?? undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Discovery failed');

      setMessage(`Found ${json.found} candidates · ${json.inserted} new leads added`);
      const refresh = await fetch('/api/growth/leads');
      const refreshJson = await refresh.json();
      if (refresh.ok) setLeads(refreshJson.leads ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Discovery failed');
    } finally {
      setLoading(false);
    }
  }, [sector, category]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-signal" />
          <h2 className="text-lg font-semibold text-void">AI Lead Discovery</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover high-value agriculture prospects from web search. All leads enter the CRM as drafts —
          no automatic contact.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {LEAD_DISCOVERY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id);
                setSector(cat.sector);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat.id
                  ? 'border-signal bg-signal/10 text-void'
                  : 'border-border hover:border-signal/40 hover:bg-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="sector">Search query / sector</Label>
            <Input
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="e.g. sera işletmesi Antalya"
              className="mt-1.5"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={runDiscovery} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Run discovery
            </Button>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
      </div>

      <AdminDataList
        title="Discovered leads"
        description="Full lead profile with scores, compliance flags, and social channels."
        rows={leads}
        searchKeys={['company', 'email', 'country', 'category']}
        searchPlaceholder="Search leads…"
        emptyMessage="No leads yet. Run AI discovery above."
        columns={[
          { key: 'company', header: 'Company' },
          { key: 'email', header: 'Email' },
          {
            key: 'category',
            header: 'Category',
            render: (r) => r.category ?? r.sector,
          },
          { key: 'country', header: 'Country', render: (r) => r.country ?? '—' },
          {
            key: 'ai_score',
            header: 'AI Score',
            render: (r) => (r.ai_score != null ? r.ai_score.toFixed(0) : '—'),
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <GrowthStatusBadge status={r.status} />,
          },
          {
            key: 'compliance',
            header: 'Compliance',
            render: (r) =>
              r.do_not_contact ? (
                <GrowthStatusBadge status="disabled" />
              ) : r.opt_in ? (
                <GrowthStatusBadge status="connected" />
              ) : (
                <span className="text-xs text-muted-foreground">Pending</span>
              ),
          },
        ]}
        toolbar={
          <Link href="/growth-ai/crm" className={buttonVariants({ variant: 'outline' })}>
            Open CRM
          </Link>
        }
      />
    </div>
  );
}
