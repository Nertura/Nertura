'use client';

import Link from 'next/link';
import { useState } from 'react';

import { buttonVariants, cn } from '@nertura/ui';

import { AdminDataList } from '@/components/admin-data-list';
import { GrowthStatusBadge } from '@/components/growth/growth-ui';
import type { ExtendedLead } from '@/lib/growth/leads';

export function CrmClient({ leads }: { leads: ExtendedLead[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = leads.find((l) => l.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <AdminDataList
        title="CRM"
        description="Relationship management with timeline, notes, and campaign history."
        rows={leads}
        searchKeys={['company', 'email', 'country']}
        searchPlaceholder="Search contacts…"
        emptyMessage="No contacts in CRM. Discover leads first."
        columns={[
          {
            key: 'company',
            header: 'Contact',
            render: (r) => (
              <button type="button" className="text-left hover:text-signal" onClick={() => setSelectedId(r.id)}>
                <span className="font-medium">{r.company}</span>
                <span className="block text-xs text-muted-foreground">{r.email}</span>
              </button>
            ),
          },
          { key: 'country', header: 'Country', render: (r) => r.country ?? '—' },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <GrowthStatusBadge status={r.status} />,
          },
          {
            key: 'last_contact_at',
            header: 'Last contact',
            render: (r) =>
              r.last_contact_at ? new Date(r.last_contact_at).toLocaleDateString() : '—',
          },
        ]}
      />

      <aside className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:sticky lg:top-20 lg:self-start">
        {selected ? (
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-void">{selected.company}</p>
              <p className="text-sm text-muted-foreground">{selected.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-muted-foreground">AI Score</p>
                <p className="mt-1 text-lg font-semibold">{selected.ai_score?.toFixed(0) ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-muted-foreground">Trust</p>
                <p className="mt-1 text-lg font-semibold">{selected.trust_score?.toFixed(0) ?? '—'}</p>
              </div>
            </div>
            <Link href={`/growth-ai/crm/${selected.id}`} className={cn(buttonVariants(), 'w-full')}>
              Open full profile
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a contact to preview relationship data.</p>
        )}
      </aside>
    </div>
  );
}
