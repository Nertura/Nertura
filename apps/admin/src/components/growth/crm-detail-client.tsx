'use client';

import { useState } from 'react';

import { Button, Input, Label } from '@nertura/ui';

import { GrowthSection, GrowthStatusBadge } from '@/components/growth/growth-ui';
import {
  computeRelationshipScore,
  type ExtendedLead,
  type LeadInteraction,
  type LeadNote,
} from '@/lib/growth/leads';

export function CrmDetailClient({
  lead,
  notes,
  interactions,
  emails,
  relationshipScore,
}: {
  lead: ExtendedLead;
  notes: LeadNote[];
  interactions: LeadInteraction[];
  emails: { id: string; subject: string; status: string; sent_at: string | null; created_at: string }[];
  relationshipScore: number;
}) {
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function addNote() {
    if (!note.trim()) return;
    const res = await fetch(`/api/growth/leads/${lead.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: note.trim() }),
    });
    if (res.ok) {
      setMessage('Note saved');
      window.location.reload();
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-void">{lead.company}</h2>
            <p className="text-muted-foreground">{lead.email}</p>
          </div>
          <GrowthStatusBadge status={lead.status} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">Relationship score</p>
            <p className="mt-1 text-2xl font-semibold">{relationshipScore}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">AI score</p>
            <p className="mt-1 text-2xl font-semibold">{lead.ai_score?.toFixed(0) ?? '—'}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">Trust score</p>
            <p className="mt-1 text-2xl font-semibold">{lead.trust_score?.toFixed(0) ?? '—'}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">Need score</p>
            <p className="mt-1 text-2xl font-semibold">{lead.need_score?.toFixed(0) ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GrowthSection title="Timeline">
          <ul className="space-y-3 rounded-2xl border bg-card p-4">
            {interactions.length === 0 ? (
              <li className="text-sm text-muted-foreground">No interactions yet</li>
            ) : (
              interactions.map((i) => (
                <li key={i.id} className="border-b pb-3 last:border-0">
                  <p className="text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(i.created_at).toLocaleString()} · {i.interaction_type}
                  </p>
                  {i.body ? <p className="mt-1 text-sm text-muted-foreground">{i.body}</p> : null}
                </li>
              ))
            )}
          </ul>
        </GrowthSection>

        <GrowthSection title="Campaign & email history">
          <ul className="space-y-3 rounded-2xl border bg-card p-4">
            {emails.length === 0 ? (
              <li className="text-sm text-muted-foreground">No emails yet</li>
            ) : (
              emails.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-2 border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{e.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.sent_at ? new Date(e.sent_at).toLocaleString() : new Date(e.created_at).toLocaleString()}
                    </p>
                  </div>
                  <GrowthStatusBadge status={e.status} />
                </li>
              ))
            )}
          </ul>
        </GrowthSection>
      </div>

      <GrowthSection title="Notes">
        <div className="rounded-2xl border bg-card p-4">
          <Label htmlFor="note">Add note</Label>
          <textarea
            id="note"
            className="mt-1.5 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button className="mt-2" size="sm" onClick={addNote}>
            Save note
          </Button>
          {message ? <p className="mt-2 text-xs text-muted-foreground">{message}</p> : null}
          <ul className="mt-4 space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                {n.body}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </GrowthSection>

      <GrowthSection title="AI recommendations">
        <div className="rounded-2xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
          {lead.do_not_contact
            ? 'Do not contact — lead is on suppression list.'
            : lead.status === 'cevaplandi'
              ? 'Follow up with a case study or product demo invitation.'
              : 'Generate personalized outreach draft via Outreach module after reviewing field/crop fit.'}
        </div>
      </GrowthSection>
    </div>
  );
}

// re-export for page use
export { computeRelationshipScore };
