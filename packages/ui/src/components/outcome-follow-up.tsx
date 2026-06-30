'use client';

import { useCallback, useEffect, useState } from 'react';

import { cn } from '../lib/utils';

export type OutcomeType = 'solved' | 'improved' | 'no_change' | 'worse';

export interface PendingFollowUpItem {
  id: string;
  diagnosisId: string;
  daysSince: number;
  dueAt: string;
  crop: string | null;
  disease: string | null;
  question: string | null;
}

const OUTCOME_LABELS: Record<OutcomeType, { tr: string; en: string }> = {
  solved: { tr: 'Çözüldü', en: 'Solved' },
  improved: { tr: 'İyileşti', en: 'Improved' },
  no_change: { tr: 'Değişmedi', en: 'No change' },
  worse: { tr: 'Kötüleşti', en: 'Worse' },
};

export function OutcomeFollowUpPanel({
  language = 'tr',
  onSubmitted,
}: {
  language?: 'tr' | 'en';
  onSubmitted?: () => void;
}) {
  const [items, setItems] = useState<PendingFollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/memory/follow-ups');
      const json = await res.json();
      if (res.ok) setItems(json.followUps ?? []);
    } catch {
      // optional
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(item: PendingFollowUpItem, outcome: OutcomeType) {
    setSubmitting(item.id);
    try {
      const res = await fetch('/api/memory/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisId: item.diagnosisId,
          outcome,
          daysSince: item.daysSince,
        }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        onSubmitted?.();
      }
    } finally {
      setSubmitting(null);
    }
  }

  if (loading || !items.length) return null;

  const title = language === 'tr' ? 'Takip: Sorun iyileşti mi?' : 'Follow-up: Did the problem improve?';

  return (
    <div className="mb-4 space-y-3 rounded-xl border border-signal/30 bg-signal/5 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border/50 bg-background p-3">
          <p className="text-xs text-muted-foreground">
            {language === 'tr' ? `${item.daysSince} gün sonra` : `After ${item.daysSince} days`}
            {item.crop ? ` · ${item.crop}` : ''}
            {item.disease ? ` · ${item.disease}` : ''}
          </p>
          {item.question && (
            <p className="mt-1 text-sm text-foreground/90 line-clamp-2">{item.question}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(['solved', 'improved', 'no_change', 'worse'] as OutcomeType[]).map((outcome) => (
              <button
                key={outcome}
                type="button"
                disabled={submitting === item.id}
                onClick={() => void submit(item, outcome)}
                className={cn(
                  'rounded-full border border-border/60 px-2.5 py-1 text-xs',
                  'text-muted-foreground transition-colors hover:border-signal/40 hover:text-foreground',
                  submitting === item.id && 'opacity-50'
                )}
              >
                {OUTCOME_LABELS[outcome][language]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
