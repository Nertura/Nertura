'use client';

import { useCallback, useState } from 'react';
import { Loader2, RefreshCw, Shield, Zap } from 'lucide-react';

import { Button } from '@nertura/ui';

import { GrowthSection, GrowthStatusBadge } from '@/components/growth/growth-ui';
import type { GrowthProvider } from '@/lib/growth/providers';

export function ProvidersClient({ providers }: { providers: GrowthProvider[] }) {
  const [list, setList] = useState(providers);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const testConnection = useCallback(async (id: string) => {
    setLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/growth/providers/${id}/test`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? json.message ?? 'Test failed');
      setMessage(json.message);
      const refresh = await fetch('/api/growth/providers');
      const data = await refresh.json();
      if (refresh.ok) setList(data.providers ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Test failed');
    } finally {
      setLoading(null);
    }
  }, []);

  const toggleFailover = useCallback(async (id: string, enabled: boolean) => {
    await fetch(`/api/growth/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ failover_enabled: enabled }),
    });
    const refresh = await fetch('/api/growth/providers');
    const data = await refresh.json();
    if (refresh.ok) setList(data.providers ?? []);
  }, []);

  return (
    <div className="space-y-8">
      <GrowthSection
        title="Email providers"
        description="Resend, SendGrid, Mailgun, Postmark, Amazon SES, and Brevo with automatic failover."
      >
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-signal" />
                  <h3 className="font-semibold text-void">{p.display_name}</h3>
                </div>
                <GrowthStatusBadge status={p.status} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Domain</dt>
                  <dd className="mt-0.5 font-medium">{p.domain ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Verified</dt>
                  <dd className="mt-0.5 font-medium">{p.domain_verified ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Daily usage</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {p.daily_usage} / {p.rate_limit_per_day}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Health score</dt>
                  <dd className="mt-0.5 font-medium">{p.health_score?.toFixed(0) ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd className="mt-0.5 font-medium">{p.priority}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">API key</dt>
                  <dd className="mt-0.5 font-medium">{p.api_key_hint ?? 'Not configured'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Last test</dt>
                  <dd className="mt-0.5 font-medium">
                    {p.last_test_at ? new Date(p.last_test_at).toLocaleString() : 'Never'}
                  </dd>
                </div>
                {p.last_error ? (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Last error</dt>
                    <dd className="mt-0.5 text-amber-700 dark:text-amber-400">{p.last_error}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => testConnection(p.id)} disabled={loading === p.id}>
                  {loading === p.id ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  )}
                  Test connection
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleFailover(p.id, !p.failover_enabled)}
                >
                  <Shield className="mr-1 h-3.5 w-3.5" />
                  Failover {p.failover_enabled ? 'on' : 'off'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </GrowthSection>
    </div>
  );
}
