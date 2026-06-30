'use client';

import { useState } from 'react';

import { Button, Input, Label } from '@nertura/ui';

import { AdminDataList } from '@/components/admin-data-list';
import { GrowthSection } from '@/components/growth/growth-ui';
import type { ComplianceSettings, SuppressionEntry } from '@/lib/growth/compliance';

export function ComplianceClient({
  settings,
  suppression,
  auditLog,
}: {
  settings: ComplianceSettings | null;
  suppression: SuppressionEntry[];
  auditLog: { id: string; action: string; entity_type: string; created_at: string }[];
}) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('Manual blacklist');
  const [message, setMessage] = useState<string | null>(null);

  async function addSuppression() {
    if (!email.trim()) return;
    const res = await fetch('/api/growth/compliance/suppression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), reason }),
    });
    if (res.ok) {
      setMessage('Added to suppression list');
      setEmail('');
      window.location.reload();
    }
  }

  return (
    <div className="space-y-10">
      <GrowthSection title="Regulatory compliance" description="GDPR, KVKK, CAN-SPAM, and domain health.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'GDPR', enabled: settings?.gdpr_enabled },
            { label: 'KVKK', enabled: settings?.kvkk_enabled },
            { label: 'CAN-SPAM', enabled: settings?.can_spam_enabled },
            { label: 'Double opt-in', enabled: settings?.double_opt_in },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-lg font-semibold">{item.enabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          ))}
        </div>
      </GrowthSection>

      <GrowthSection title="DNS & domain health">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">DMARC</p>
            <p className="mt-2 font-semibold capitalize">{settings?.dmarc_status ?? 'unknown'}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">SPF</p>
            <p className="mt-2 font-semibold capitalize">{settings?.spf_status ?? 'unknown'}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">DKIM</p>
            <p className="mt-2 font-semibold capitalize">{settings?.dkim_status ?? 'unknown'}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Domain reputation</p>
            <p className="mt-2 text-lg font-semibold tabular-nums">
              {settings?.domain_reputation_score?.toFixed(0) ?? '—'}
            </p>
          </div>
        </div>
      </GrowthSection>

      <GrowthSection title="Suppression list">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="block-email">Email</Label>
            <Input id="block-email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <div className="flex-1">
            <Label htmlFor="block-reason">Reason</Label>
            <Input id="block-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5" />
          </div>
          <Button onClick={addSuppression}>Add to blacklist</Button>
        </div>
        {message ? <p className="mb-4 text-sm text-muted-foreground">{message}</p> : null}
        <AdminDataList
          title=""
          description=""
          rows={suppression}
          searchKeys={['email', 'reason']}
          columns={[
            { key: 'email', header: 'Email' },
            { key: 'reason', header: 'Reason' },
            { key: 'source', header: 'Source' },
            {
              key: 'created_at',
              header: 'Added',
              render: (r) => new Date(r.created_at).toLocaleString(),
            },
          ]}
        />
      </GrowthSection>

      <GrowthSection title="Audit log">
        <AdminDataList
          title=""
          description=""
          rows={auditLog}
          columns={[
            { key: 'action', header: 'Action' },
            { key: 'entity_type', header: 'Entity' },
            {
              key: 'created_at',
              header: 'When',
              render: (r) => new Date(r.created_at).toLocaleString(),
            },
          ]}
        />
      </GrowthSection>
    </div>
  );
}
