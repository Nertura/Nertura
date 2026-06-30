'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';

import { Button, Input } from '@nertura/ui';

import { AdminDataList } from '@/components/admin-data-list';
import { GrowthStatusBadge } from '@/components/growth/growth-ui';
import { emailLogsToCsv, type EmailLogEntry } from '@/lib/growth/email-logs';

export function EmailLogsClient({ logs }: { logs: EmailLogEntry[] }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (deliveryFilter && l.delivery_status !== deliveryFilter) return false;
      return true;
    });
  }, [logs, statusFilter, deliveryFilter]);

  function exportCsv() {
    const csv = emailLogsToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nertura-email-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <select
            className="mt-1 block rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="taslak">Draft</option>
            <option value="onaylandi">Approved</option>
            <option value="sent">Sent</option>
            <option value="reddedildi">Rejected</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Delivery</label>
          <select
            className="mt-1 block rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="queued">Queued</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="bounced">Bounced</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <AdminDataList
        title="Email logs"
        description="Every email logged — queued through delivered, opened, clicked, bounced."
        rows={filtered}
        searchKeys={['subject']}
        searchPlaceholder="Search subject…"
        columns={[
          {
            key: 'to',
            header: 'To',
            render: (r) => (
              <div>
                <p className="font-medium">{r.leads?.email ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{r.leads?.company}</p>
              </div>
            ),
          },
          { key: 'subject', header: 'Subject', className: 'max-w-[200px]' },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <GrowthStatusBadge status={r.status} />,
          },
          {
            key: 'delivery_status',
            header: 'Delivery',
            render: (r) => (
              <GrowthStatusBadge status={r.delivery_status ?? 'queued'} />
            ),
          },
          {
            key: 'sent_at',
            header: 'Sent',
            render: (r) => (r.sent_at ? new Date(r.sent_at).toLocaleString() : '—'),
          },
          {
            key: 'engagement',
            header: 'Engagement',
            render: (r) => (
              <span className="text-xs tabular-nums">
                {r.opened ? 'Opened' : '—'}
                {r.clicked ? ' · Clicked' : ''}
                {r.bounced ? ' · Bounced' : ''}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
