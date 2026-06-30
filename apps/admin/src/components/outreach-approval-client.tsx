'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button, Input, cn } from '@nertura/ui';

interface DraftRow {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
  leads: {
    id: string;
    name: string | null;
    company: string;
    sector: string;
    email: string;
  };
}

export function OutreachApprovalClient({
  initialDrafts,
  embedded = false,
}: {
  initialDrafts: DraftRow[];
  embedded?: boolean;
}) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{
    configured: boolean;
    apiKeySet: boolean;
    fromEmailSet: boolean;
    message: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/outreach/drafts');
    const json = await res.json();
    if (res.ok) setDrafts(json.drafts ?? []);
  }, []);

  useEffect(() => {
    setDrafts(initialDrafts);
  }, [initialDrafts]);

  useEffect(() => {
    void fetch('/api/outreach/status')
      .then((r) => r.json())
      .then(setResendStatus)
      .catch(() => setResendStatus(null));
  }, []);

  function startEdit(d: DraftRow) {
    setEditingId(d.id);
    setEditSubject(d.subject);
    setEditBody(d.body);
  }

  async function saveEdit(id: string) {
    setLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/outreach/drafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: editSubject, body: editBody }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      setEditingId(null);
      await refresh();
      setMessage('Taslak güncellendi.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Hata');
    } finally {
      setLoading(null);
    }
  }

  async function approve(id: string) {
    setLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/outreach/drafts/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Approve failed');
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      setMessage('Taslak onaylandı — gönderim kuyruğuna alındı.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Hata');
    } finally {
      setLoading(null);
    }
  }

  async function reject(id: string) {
    setLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/outreach/drafts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Reject failed');
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      setMessage('Taslak reddedildi.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Hata');
    } finally {
      setLoading(null);
    }
  }

  async function sendApproved() {
    setLoading('send-all');
    setSendResult(null);
    setMessage(null);
    try {
      const res = await fetch('/api/outreach/send', { method: 'POST' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Send failed');
      }
      const json = await res.json();
      setSendResult(`Gönderildi: ${json.sent}, atlandı: ${json.skipped ?? 0}, hata: ${json.failed}`);
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gönderim hatası');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {!embedded && (
            <h1 className="text-2xl font-semibold text-void">Outreach — Taslak Onay</h1>
          )}
          {embedded && (
            <h2 className="text-lg font-semibold text-void">Email drafts — founder approval</h2>
          )}
          <p className={`text-sm text-muted-foreground ${embedded ? 'mt-1' : 'mt-2'}`}>
            Review AI-generated outreach emails. Approve, edit, reject, or schedule — nothing sends
            automatically.
          </p>
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Kurucu onayı zorunludur — otomatik gönderim yoktur. KVKK/GDPR uyumu sizin
            sorumluluğunuzdadır; do_not_contact lead&apos;lere mail gönderilmez.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={loading === 'send-all' || !resendStatus?.configured}
          onClick={() => void sendApproved()}
        >
          Onaylananları Gönder (Resend)
        </Button>
      </div>

      {(message || sendResult) && (
        <p className="mt-4 text-sm text-muted-foreground">{message ?? sendResult}</p>
      )}

      {resendStatus && (
        <div
          className={cn(
            'mt-4 rounded-lg border px-4 py-3 text-sm',
            resendStatus.configured
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          )}
        >
          <p className="font-medium">Resend setup</p>
          <p className="mt-1 text-xs">{resendStatus.message}</p>
          <ul className="mt-2 space-y-0.5 text-xs">
            <li>API key: {resendStatus.apiKeySet ? 'set' : 'missing'}</li>
            <li>From email: {resendStatus.fromEmailSet ? 'set' : 'missing'}</li>
          </ul>
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="mt-8 nertura-empty-state">
          <p className="font-medium text-void">No outreach drafts pending</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Weekly pipeline creates AI drafts for founder review. Nothing sends without your approval.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {drafts.map((d) => (
            <article
              key={d.id}
              className={cn(
                'rounded-xl border bg-card p-5 shadow-sm',
                loading === d.id && 'opacity-60'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-void">{d.leads.company}</p>
                  <p className="text-sm text-muted-foreground">
                    {d.leads.sector} · {d.leads.email}
                    {d.leads.name ? ` · ${d.leads.name}` : ''}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(d.created_at).toLocaleString('tr-TR')}
                </p>
              </div>

              {editingId === d.id ? (
                <div className="mt-4 space-y-3">
                  <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
                  <textarea
                    className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={() => void saveEdit(d.id)}>
                      Kaydet
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      İptal
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm font-medium">{d.subject}</p>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm text-foreground/90">
                    {d.body}
                  </pre>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => void approve(d.id)}>
                      Onayla
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => startEdit(d)}>
                      Düzenle
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => void reject(d.id)}
                    >
                      Reddet
                    </Button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
