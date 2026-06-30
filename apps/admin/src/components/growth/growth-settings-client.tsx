'use client';

import { useState } from 'react';

import { Button, Input, Label } from '@nertura/ui';

import { GrowthSection } from '@/components/growth/growth-ui';
import type { GrowthSettings } from '@/lib/growth/scheduler';

export function GrowthSettingsClient({ settings }: { settings: GrowthSettings | null }) {
  const [form, setForm] = useState({
    org_language: settings?.org_language ?? 'tr',
    daily_email_limit: settings?.daily_email_limit ?? 500,
    hourly_email_limit: settings?.hourly_email_limit ?? 50,
    per_domain_limit: settings?.per_domain_limit ?? 100,
    per_provider_limit: settings?.per_provider_limit ?? 1000,
    automation_enabled: settings?.automation_enabled ?? true,
    founder_approval_required: settings?.founder_approval_required ?? true,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/growth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('Settings saved.');
    } catch {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <GrowthSection title="Growth AI settings" description="Rate limits, automation, and localization.">
        <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <Label htmlFor="lang">Organization language</Label>
            <select
              id="lang"
              className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.org_language}
              onChange={(e) => setForm((f) => ({ ...f, org_language: e.target.value }))}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="daily">Daily email limit</Label>
              <Input
                id="daily"
                type="number"
                value={form.daily_email_limit}
                onChange={(e) => setForm((f) => ({ ...f, daily_email_limit: Number(e.target.value) }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hourly">Hourly email limit</Label>
              <Input
                id="hourly"
                type="number"
                value={form.hourly_email_limit}
                onChange={(e) => setForm((f) => ({ ...f, hourly_email_limit: Number(e.target.value) }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="domain">Per domain limit</Label>
              <Input
                id="domain"
                type="number"
                value={form.per_domain_limit}
                onChange={(e) => setForm((f) => ({ ...f, per_domain_limit: Number(e.target.value) }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="provider">Per provider limit</Label>
              <Input
                id="provider"
                type="number"
                value={form.per_provider_limit}
                onChange={(e) => setForm((f) => ({ ...f, per_provider_limit: Number(e.target.value) }))}
                className="mt-1.5"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.automation_enabled}
              onChange={(e) => setForm((f) => ({ ...f, automation_enabled: e.target.checked }))}
            />
            AI automation enabled (drafts only)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.founder_approval_required}
              onChange={(e) => setForm((f) => ({ ...f, founder_approval_required: e.target.checked }))}
            />
            Founder approval required before send
          </label>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </GrowthSection>
    </div>
  );
}
