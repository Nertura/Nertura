'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { DoctorDiagnosis, EvidenceCard } from '@nertura/types';
import {
  AiChatShell,
  Alert,
  AlertDescription,
  AppBadge,
  Button,
  DoctorAnswerCard,
  DoctorFeedbackButtons,
  EvidenceCardsPanel,
  cn,
  friendlyAiError,
} from '@nertura/ui';

import { GuestHomeComposer, GuestSignupPrompt } from '@/components/guest-home-composer';
import { GuestHomeHero } from '@/components/guest-home-hero';
import {
  EXAMPLE_QUESTION_POOL_EN,
  EXAMPLE_QUESTION_POOL_TR,
  INITIAL_EXAMPLES_EN,
  INITIAL_EXAMPLES_TR,
  pickRandomExamples,
} from '@/lib/example-questions';
import {
  GUEST_DISPLAY_ANALYSIS_LIMIT,
  MARKETING_COPY,
  useMarketingLocale,
} from '@/lib/use-marketing-locale';
import { useRotatingPlaceholder } from '@/lib/use-rotating-placeholder';
import { useDashboardUrls } from '@/lib/use-dashboard-urls';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  diagnosis?: DoctorDiagnosis;
  analysisId?: string | null;
  memoryEventId?: string | null;
  evidenceCards?: EvidenceCard[];
  imageUrl?: string | null;
};

function buildAuthParams(question: string): { q?: string; next: string } {
  const trimmed = question.trim();
  if (!trimmed) return { next: '/doctor' };
  return { q: trimmed, next: '/doctor' };
}

type SignupGateReason = 'locked' | 'limit' | null;

export function HomeDoctorForm() {
  const locale = useMarketingLocale();
  const copy = MARKETING_COPY[locale];
  const rotatingPlaceholder = useRotatingPlaceholder(copy.rotatingPlaceholders);
  const composerPlaceholder =
    locale === 'tr' ? rotatingPlaceholder : copy.placeholder;
  const examplePool = locale === 'tr' ? EXAMPLE_QUESTION_POOL_TR : EXAMPLE_QUESTION_POOL_EN;
  const initialExamples =
    locale === 'tr' ? [...INITIAL_EXAMPLES_TR] : [...INITIAL_EXAMPLES_EN];

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastRequestRef = useRef<{ text: string } | null>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const [signupGateReason, setSignupGateReason] = useState<SignupGateReason>(null);
  const [usageUsed, setUsageUsed] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [examples, setExamples] = useState<string[]>(initialExamples);

  const pendingQuestion =
    query.trim() || lastRequestRef.current?.text?.trim() || '';
  const authParams = useMemo(
    () => buildAuthParams(pendingQuestion),
    [pendingQuestion]
  );
  const dashboardUrls = useDashboardUrls(authParams);

  useEffect(() => {
    setExamples(locale === 'tr' ? [...INITIAL_EXAMPLES_TR] : [...INITIAL_EXAMPLES_EN]);
  }, [locale]);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/doctor/conversations');
      if (!res.ok) return;
      const json = await res.json();
      if (json.usage?.used != null) setUsageUsed(json.usage.used);
    })();
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function analysisNote(): string {
    if (usageUsed > 0) {
      const remaining = Math.max(0, GUEST_DISPLAY_ANALYSIS_LIMIT - usageUsed);
      return copy.analysisRemaining(remaining);
    }
    return copy.analysisGuest;
  }

  function handleLockedAction() {
    setSignupGateReason('locked');
  }

  function showLimitSignup() {
    setSignupGateReason('limit');
  }

  async function submitQuestion(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (usageUsed >= GUEST_DISPLAY_ANALYSIS_LIMIT) {
      lastRequestRef.current = { text: trimmed };
      showLimitSignup();
      return;
    }

    setError(null);
    setRetryable(false);
    setSignupGateReason(null);
    setLoading(true);
    lastRequestRef.current = { text: trimmed };

    try {
      const res = await fetch('/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId: conversationId ?? undefined,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        limitReached?: boolean;
        retryable?: boolean;
        signupUrl?: string;
        usage?: { used?: number };
        userMessage?: ChatMessage;
        message?: ChatMessage;
        conversationId?: string;
      };

      if (json.usage?.used != null) setUsageUsed(json.usage.used);

      if (!res.ok) {
        if (json.limitReached === true) {
          showLimitSignup();
          return;
        }
        if (json.retryable) setRetryable(true);
        throw new Error(json.error ?? 'Request failed');
      }

      const userMsg = json.userMessage as ChatMessage;
      const assistantMsg = json.message as ChatMessage;

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      if (json.conversationId) setConversationId(json.conversationId);

      if (json.limitReached === true) {
        showLimitSignup();
      } else {
        setQuery('');
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : undefined;
      setError(friendlyAiError(raw, locale));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitQuestion(query);
  }

  const signupRequired = signupGateReason !== null;
  const hasChat = messages.length > 0 || loading;
  const usageHint = !signupRequired ? (
    <AppBadge variant="subtle">{analysisNote()}</AppBadge>
  ) : null;

  const signupPrompt = signupRequired ? (
    <GuestSignupPrompt
      title={
        signupGateReason === 'limit'
          ? copy.signupLimitPromptTitle
          : copy.signupPromptTitle
      }
      body={
        signupGateReason === 'limit' ? copy.signupLimitPromptBody : copy.signupPromptBody
      }
      signupLabel={copy.signup}
      loginLabel={copy.login}
      signupUrl={dashboardUrls.register}
      loginUrl={dashboardUrls.login}
      linksReady={dashboardUrls.ready}
    />
  ) : null;

  const composerDisabled = signupGateReason === 'limit';

  const composerProps = {
    value: query,
    onChange: setQuery,
    onSubmit: handleSubmit,
    loading,
    disabled: composerDisabled,
    placeholder: composerPlaceholder,
    onLockedAction: handleLockedAction,
    sendLabel: copy.send,
    addLabel: copy.addAction,
    photoLabel: copy.lockedPhoto,
    galleryLabel: copy.lockedGallery,
    voiceLabel: copy.lockedVoice,
    cancelLabel: copy.lockedCancel,
    lockedFooter: copy.lockedFooter,
    lockedSignup: copy.lockedSignup,
  };

  return (
    <AiChatShell
      footer={
        hasChat ? (
          <div className="space-y-2">
            {signupPrompt ? (
              <div className="mx-auto w-full max-w-[960px] px-4 pt-2 sm:px-6">{signupPrompt}</div>
            ) : null}
            <GuestHomeComposer {...composerProps} footerNote={usageHint} />
          </div>
        ) : null
      }
    >
      <div className="flex flex-1 flex-col overflow-y-auto">
        {!hasChat ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:py-8">
            <GuestHomeHero headline={copy.headline}>
              {signupPrompt}

              <GuestHomeComposer {...composerProps} centered footerNote={usageHint} />

              <p className="mt-4 max-w-md text-center text-xs text-muted-foreground/90">
                {copy.trustSecurity}
              </p>

              <div className="mt-6 flex w-full flex-col items-center gap-3">
                <div className="flex w-full flex-wrap justify-center gap-2 px-1">
                  {examples.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setQuery(prompt)}
                      className="rounded-full border border-border/70 bg-card px-3 py-2 text-left text-xs text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.98] sm:text-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setExamples(pickRandomExamples(examplePool, 3))}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copy.refreshExamples}
                </button>
              </div>
            </GuestHomeHero>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[960px] flex-1 space-y-6 px-4 py-8 pb-4 sm:px-6">
            {messages.map((msg, msgIndex) => (
              <div
                key={msg.id}
                className={cn(
                  'animate-slide-up',
                  msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                )}
              >
                {msg.role === 'assistant' && msg.diagnosis ? (
                  <div className="w-full max-w-full">
                    <DoctorAnswerCard
                      diagnosis={msg.diagnosis}
                      language={locale}
                      hasImage={messages
                        .slice(0, msgIndex)
                        .some((m) => m.role === 'user' && Boolean(m.imageUrl))}
                      evidenceSlot={
                        msg.evidenceCards?.length ? (
                          <EvidenceCardsPanel
                            cards={msg.evidenceCards}
                            language={locale}
                            hideHeading
                          />
                        ) : null
                      }
                    />
                    {msg.analysisId ? (
                      <DoctorFeedbackButtons
                        analysisId={msg.analysisId}
                        memoryEventId={msg.memoryEventId}
                        language={locale}
                        feedbackUrl="/api/doctor/feedback"
                      />
                    ) : null}
                  </div>
                ) : (
                  <div className="chat-message-user max-w-[85%]">{msg.content}</div>
                )}
              </div>
            ))}
            {loading && (
              <div
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm shadow-sm animate-fade-in"
                role="status"
                aria-live="polite"
              >
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-muted-foreground">{copy.thinking}</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {error && !signupRequired && (
          <div className="mx-auto w-full max-w-[960px] px-4 pb-4 sm:px-6">
            <Alert variant="destructive" className="animate-fade-in">
              <AlertDescription className="flex flex-col gap-2">
                <span>{error}</span>
                {retryable && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const last = lastRequestRef.current;
                      if (last) void submitQuestion(last.text);
                    }}
                    disabled={loading}
                  >
                    {copy.retry}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </AiChatShell>
  );
}
