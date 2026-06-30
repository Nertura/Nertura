'use client';

import { humanReadableEvidenceSummary } from '../lib/doctor-display-polish';
import { getDoctorUiCopy, type UiLanguage } from '../lib/i18n/doctor-ui-copy';
import { cn } from '../lib/utils';

export type FeedbackType =
  | 'helpful'
  | 'not_helpful'
  | 'problem_solved'
  | 'still_sick'
  | 'wrong_diagnosis';

export interface EvidenceCard {
  type: string;
  title: string;
  summary: string;
  confidence?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

const CARD_ICONS: Record<string, string> = {
  knowledge_bank: '📚',
  farm_memory: '🌾',
  project_memory: '📋',
  disease_history: '🦠',
  image_analysis: '📷',
  weather_regional: '🌤',
  similar_cases: '🔍',
  conversation_history: '💬',
};

function cardTitle(type: string, fallback: string, language: UiLanguage): string {
  const copy = getDoctorUiCopy(language).evidence.cards;
  return copy[type as keyof typeof copy] ?? fallback;
}

function formatCardSummary(summary: unknown): string {
  return humanReadableEvidenceSummary(summary);
}

export function EvidenceCardsPanel({
  cards,
  language = 'tr',
  hideHeading = false,
}: {
  cards: EvidenceCard[];
  language?: UiLanguage;
  hideHeading?: boolean;
}) {
  if (!cards.length) return null;

  const evidenceCopy = getDoctorUiCopy(language).evidence;

  return (
    <div className={hideHeading ? 'space-y-2' : 'mt-3 space-y-2'}>
      {!hideHeading && (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {evidenceCopy.heading}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {cards.map((card, i) => {
          const title = cardTitle(card.type, card.title, language);
          const summary = formatCardSummary(card.summary);
          if (!summary && card.type === 'image_analysis') return null;
          return (
            <div
              key={`${card.type}-${i}`}
              className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm"
            >
              <p className="font-medium text-foreground/90">
                {CARD_ICONS[card.type] ?? '•'} {title}
              </p>
              {summary ? (
                <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                  {summary}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DoctorFeedbackButtons({
  analysisId,
  memoryEventId,
  language = 'tr',
  feedbackUrl,
  onSubmitted,
}: {
  analysisId: string;
  memoryEventId?: string | null;
  language?: UiLanguage;
  feedbackUrl: string;
  onSubmitted?: (type: FeedbackType) => void;
}) {
  const evidenceCopy = getDoctorUiCopy(language).evidence;

  async function submit(type: FeedbackType) {
    try {
      const res = await fetch(feedbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          memoryEventId: memoryEventId ?? undefined,
          feedbackType: type,
        }),
      });
      if (!res.ok) return;
      onSubmitted?.(type);
    } catch {
      // silent
    }
  }

  const types: FeedbackType[] = [
    'helpful',
    'not_helpful',
    'problem_solved',
    'still_sick',
    'wrong_diagnosis',
  ];

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <p className="text-xs text-muted-foreground">{evidenceCopy.feedbackPrompt}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => void submit(type)}
            className={cn(
              'rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs',
              'text-muted-foreground transition-colors hover:border-signal/40 hover:text-foreground'
            )}
          >
            {evidenceCopy.feedback[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
