'use client';

import { useCallback, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

import { Button, Input, Label } from '@nertura/ui';

import { AdminDataList } from '@/components/admin-data-list';
import { GrowthStatusBadge } from '@/components/growth/growth-ui';
import type { GrowthCampaign } from '@/lib/growth/campaigns';

export function CampaignsClient({ campaigns }: { campaigns: GrowthCampaign[] }) {
  const [list, setList] = useState(campaigns);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const createCampaign = useCallback(async () => {
    if (!name.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/growth/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setName('');
      const refresh = await fetch('/api/growth/campaigns');
      const data = await refresh.json();
      if (refresh.ok) setList(data.campaigns ?? []);
      setMessage('Campaign created as draft — founder review required.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [name]);

  async function updateStatus(id: string, status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/growth/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      const refresh = await fetch('/api/growth/campaigns');
      const data = await refresh.json();
      if (refresh.ok) setList(data.campaigns ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-void">Campaign Builder</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          AI estimates reach, open rate, and CTR. Nothing sends without founder approval.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="campaign-name">Campaign name</Label>
            <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <Button onClick={createCampaign} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Generate campaign
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </div>

      <AdminDataList
        title="Campaigns"
        description="Target audience, AI confidence, and approval workflow."
        rows={list}
        searchKeys={['name', 'target_country', 'target_crop']}
        columns={[
          { key: 'name', header: 'Campaign' },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <GrowthStatusBadge status={r.status} />,
          },
          {
            key: 'estimated_reach',
            header: 'Reach',
            render: (r) => r.estimated_reach?.toLocaleString() ?? '—',
          },
          {
            key: 'expected_open_rate',
            header: 'Open rate',
            render: (r) => (r.expected_open_rate != null ? `${r.expected_open_rate}%` : '—'),
          },
          {
            key: 'expected_ctr',
            header: 'CTR',
            render: (r) => (r.expected_ctr != null ? `${r.expected_ctr}%` : '—'),
          },
          {
            key: 'ai_confidence',
            header: 'AI confidence',
            render: (r) => (r.ai_confidence != null ? `${r.ai_confidence}%` : '—'),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                {r.status === 'draft' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'pending_review')}>
                      Founder review
                    </Button>
                    <Button size="sm" onClick={() => updateStatus(r.id, 'approved')}>
                      Approve
                    </Button>
                  </>
                )}
                {r.status === 'pending_review' && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(r.id, 'approved')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'rejected')}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
