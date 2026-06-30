'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { DoctorDiagnosis, EvidenceCard } from '@nertura/types';
import { PHOTO_QUICK_ACTIONS, type ConversationLanguage } from '@nertura/ai';
import { normalizeImageMimeType } from '@nertura/utils';
import {
  AiChatComposer,
  AiChatHeader,
  AiChatHero,
  AiChatShell,
  AiChatThinking,
  Alert,
  AlertDescription,
  Button,
  DoctorAnswerCard,
  DoctorFeedbackButtons,
  EvidenceCardsPanel,
  OutcomeFollowUpPanel,
  cn,
  friendlyAiError,
  getDoctorUiCopy,
  type HistoryItem,
} from '@nertura/ui';

import { DashboardHeaderActions } from '@/components/dashboard/top-bar';
import { DoctorHistoryDrawerWithTabs } from '@/components/doctor/doctor-side-drawer';
import { DoctorIntelligencePanel } from '@/components/doctor/doctor-intelligence-panel';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';
import {
  FieldContextSelector,
  getStoredFieldId,
  setStoredFieldId,
  type FieldOption,
} from '@/components/doctor/field-context-selector';
import { PremiumReportsPanel } from '@/components/reports/premium-reports-panel';
import {
  ChatImageLightbox,
  ChatMessageImage,
} from '@/components/doctor/chat-message-image';
import {
  getDashboardCopy,
  type DashboardLocale,
} from '@/lib/i18n/dashboard-copy';

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

const ACTIVE_CONVERSATION_KEY = 'nertura_dashboard_active_conversation';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

import type { SubscriptionTier } from '@/lib/navigation-tier';

interface DoctorChatAppProps {
  email: string;
  organizationName?: string;
  tier?: SubscriptionTier;
  fields?: FieldOption[];
  fieldGreeting?: {
    fieldId: string;
    fieldName: string;
    locationLabel: string | null;
    crop: string | null;
  } | null;
  locale?: DashboardLocale;
}

export function DoctorChatApp({
  email,
  organizationName,
  tier = 'free',
  fields = [],
  fieldGreeting,
  locale: initialLocale = 'tr',
}: DoctorChatAppProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastRequestRef = useRef<{ text: string; image?: string; mime?: string } | null>(null);
  const pendingPhotoRef = useRef<{ data: string; mime: string } | null>(null);

  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'history' | 'cases'>('history');
  const [error, setError] = useState<string | null>(null);
  const [uploadRetryable, setUploadRetryable] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    remaining: number;
    credits?: number;
    usingCredits?: boolean;
  } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<HistoryItem[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [intakeBootstrapped, setIntakeBootstrapped] = useState(false);
  const autoSubmittedRef = useRef(false);
  const conversationBootstrappedRef = useRef(false);
  const [conversationLanguage, setConversationLanguage] = useState<ConversationLanguage>(initialLocale);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const ui = getDashboardCopy(conversationLanguage);
  const doctorCopy = ui.doctor;
  const shellCopy = getDoctorUiCopy(conversationLanguage).shell;

  const photoQuickActions = PHOTO_QUICK_ACTIONS[conversationLanguage];
  const photoUploadedLabel = doctorCopy.photoUploaded;
  const showPhotoQuickActions =
    !loading &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'assistant' &&
    (messages[messages.length - 1]?.content.includes('Fotoğraf yüklendi') ||
      messages[messages.length - 1]?.content.includes(photoUploadedLabel) ||
      messages[messages.length - 1]?.content.includes('Photo uploaded'));

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/ai/conversations/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Failed to load conversation');
    setMessages(json.messages ?? []);
    setConversationId(id);
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
  }, []);

  useEffect(() => {
    const urlFieldId = searchParams.get('fieldId');
    const urlCaseId = searchParams.get('caseId');
    const urlQuery = searchParams.get('q');

    if (urlFieldId) {
      setSelectedFieldId(urlFieldId);
      setStoredFieldId(urlFieldId);
    } else {
      setSelectedFieldId(getStoredFieldId());
    }
    if (urlCaseId) setActiveCaseId(urlCaseId);
    if (urlQuery && !intakeBootstrapped) {
      setQuery(urlQuery);
      setIntakeBootstrapped(true);
    }
  }, [searchParams, intakeBootstrapped]);

  useEffect(() => {
    const urlConversation = searchParams.get('conversation');
    if (urlConversation && !conversationBootstrappedRef.current && !historyLoading) {
      conversationBootstrappedRef.current = true;
      void loadConversation(urlConversation);
    }
  }, [searchParams, historyLoading, loadConversation]);

  const refreshConversations = useCallback(async () => {
    const res = await fetch('/api/ai/conversations');
    const json = await res.json();
    if (!res.ok) return;
    setConversations(json.conversations ?? []);
    if (json.usage) setUsage(json.usage);
    return json as { conversations: HistoryItem[] };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setHistoryLoading(true);
      try {
        const data = await refreshConversations();
        if (cancelled) return;
        const savedId = localStorage.getItem(ACTIVE_CONVERSATION_KEY);
        if (savedId && data?.conversations.some((c) => c.id === savedId)) {
          await loadConversation(savedId);
        }
      } catch {
        // optional
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [loadConversation, refreshConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleNewChat() {
    setConversationId(null);
    setMessages([]);
    setQuery('');
    setImagePreview(null);
    setImageMime(null);
    setError(null);
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const normalized = normalizeImageMimeType(file.type);
    const isLikelyImage =
      !file.type ||
      file.type.startsWith('image/') ||
      file.type === 'application/octet-stream' ||
      Boolean(normalized);

    if (!isLikelyImage) {
      setError(friendlyAiError(doctorCopy.uploadErrorType, conversationLanguage));
      setUploadRetryable(true);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError(friendlyAiError(doctorCopy.uploadErrorSize, conversationLanguage));
      setUploadRetryable(true);
      return;
    }

    setError(null);
    setUploadRetryable(false);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
      setImageMime(normalized ?? (file.type || 'image/jpeg'));
    };
    reader.readAsDataURL(file);
  }

  async function submitQuestion(text: string, image?: string | null, mime?: string | null) {
    const trimmed = text.trim();
    const hasImage = Boolean(image && mime);
    if (!trimmed && !hasImage) return;

    setError(null);
    setUploadRetryable(false);
    setLoading(true);
    lastRequestRef.current = { text: trimmed, image: image ?? undefined, mime: mime ?? undefined };
    if (image && mime) {
      pendingPhotoRef.current = { data: image, mime };
    }

    try {
      const res = await fetch('/api/ai/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId: conversationId ?? undefined,
          imageBase64: image ?? undefined,
          imageMimeType: mime ?? undefined,
          fieldId: selectedFieldId ?? undefined,
          caseId: activeCaseId ?? undefined,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        errorCode?: string;
        step?: string;
        detail?: string;
        limitReached?: boolean;
        retryable?: boolean;
        signupUrl?: string;
        usage?: { used?: number; remaining?: number; limit?: number; credits?: number };
        fieldCaseLinked?: boolean;
        caseId?: string | null;
        caseAutoCreated?: boolean;
        userMessage?: { imageUrl?: string | null };
        message?: ChatMessage;
        conversationId?: string;
        language?: 'tr' | 'en';
        imageOnly?: boolean;
      };

      if (!res.ok) {
        if (json.limitReached) setLimitReached(true);
        setUploadRetryable(Boolean(json.retryable) || Boolean(image && mime));
        if (json.detail) {
          console.error('[doctor-ui] API error detail:', json.detail, json.errorCode, json.step);
        }
        throw new Error(json.error ?? 'Request failed');
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        created_at: new Date().toISOString(),
        imageUrl: json.userMessage?.imageUrl ?? image ?? null,
      };

      setMessages((prev) => [...prev, userMsg, json.message as ChatMessage]);
      if (json.conversationId) {
        setConversationId(json.conversationId);
        localStorage.setItem(ACTIVE_CONVERSATION_KEY, json.conversationId);
      }
      if (json.caseId) {
        setActiveCaseId(json.caseId);
      }
      if (json.language === 'tr' || json.language === 'en') {
        setConversationLanguage(json.language);
      }
      if (!json.imageOnly) {
        pendingPhotoRef.current = null;
      }
      if (json.usage?.used != null && json.usage.limit != null && json.usage.remaining != null) {
        setUsage({
          used: json.usage.used,
          limit: json.usage.limit,
          remaining: json.usage.remaining,
          credits: json.usage.credits,
        });
      }
      if (json.limitReached) setLimitReached(true);

      await refreshConversations();
      setQuery('');
      setImagePreview(null);
      setImageMime(null);
    } catch (err) {
      const raw = err instanceof Error ? err.message : undefined;
      // API already returns farmer-facing copy — avoid double-mapping to generic fallback.
      setError(raw ? raw : friendlyAiError(undefined, conversationLanguage));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitQuestion(query, imagePreview, imageMime);
  }

  useEffect(() => {
    const q = searchParams.get('q');
    if (!q?.trim() || autoSubmittedRef.current || historyLoading || loading) return;
    if (messages.length > 0) return;
    autoSubmittedRef.current = true;
    void submitQuestion(q);
  }, [historyLoading, loading, messages.length, searchParams]);

  const hasChat = messages.length > 0 || loading;
  const usageHint = usage ? doctorCopy.analysesRemaining(usage.remaining) : null;

  const openDrawer = (tab: 'history' | 'cases') => {
    setDrawerTab(tab);
    setHistoryOpen(true);
  };

  const activeFieldGreeting =
    fieldGreeting && selectedFieldId === fieldGreeting.fieldId ? fieldGreeting : null;
  const greetingLocation = activeFieldGreeting?.locationLabel ?? doctorCopy.yourFarm;

  const latestAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const latestEvidence = latestAssistant?.evidenceCards ?? [];
  const hasFieldProfile = fields.length > 0 || Boolean(selectedFieldId);

  return (
    <AiChatShell
      historyDrawer={
        <DoctorHistoryDrawerWithTabs
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          tab={drawerTab}
          onTabChange={setDrawerTab}
          historyItems={conversations}
          activeConversationId={conversationId}
          onSelectConversation={(id) => void loadConversation(id)}
          historyLoading={historyLoading}
          selectedFieldId={selectedFieldId}
          activeCaseId={activeCaseId}
          locale={conversationLanguage}
        />
      }
      header={
        <AiChatHeader
          showHistory
          onOpenHistory={() => openDrawer('history')}
          onNewChat={handleNewChat}
          usageHint={usageHint}
          labels={{ newChat: shellCopy.newChat, history: shellCopy.history }}
          trailing={
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Menü"
              >
                Menü
              </Button>
              {hasChat && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="xl:hidden"
                  onClick={() => setEvidenceOpen(true)}
                >
                  {shellCopy.evidence}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden text-xs sm:inline-flex lg:hidden"
                onClick={() => openDrawer('cases')}
              >
                {doctorCopy.fieldCases}
              </Button>
              <DashboardHeaderActions email={email} organizationName={organizationName} />
            </div>
          }
        />
      }
      footer={
        !hasChat ? null : (
          <AiChatComposer
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            loading={loading}
            disabled={limitReached}
            placeholder={doctorCopy.placeholder}
            language={conversationLanguage}
            fileRef={fileRef}
            onImageChange={handleImageChange}
            imagePreview={imagePreview}
            onClearImage={() => {
              setImagePreview(null);
              setImageMime(null);
            }}
          />
        )
      }
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <DoctorSidebar
          className="hidden lg:flex"
          language={conversationLanguage}
          tier={tier}
          onNewChat={handleNewChat}
          onOpenHistory={() => openDrawer('history')}
          onOpenCases={() => openDrawer('cases')}
          usage={usage}
        />

        {sidebarOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] lg:hidden"
              aria-label={doctorCopy.closeSidebar}
              onClick={() => setSidebarOpen(false)}
            />
            <DoctorSidebar
              className="fixed inset-y-0 left-0 z-[70] lg:hidden"
              language={conversationLanguage}
              tier={tier}
              onNewChat={() => {
                handleNewChat();
                setSidebarOpen(false);
              }}
              onOpenHistory={() => {
                openDrawer('history');
                setSidebarOpen(false);
              }}
              onOpenCases={() => {
                openDrawer('cases');
                setSidebarOpen(false);
              }}
              usage={usage}
            />
          </>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="chat-container pt-4">
          {activeFieldGreeting && (
            <Alert className="mb-4 border-emerald-500/25 bg-emerald-500/5">
              <AlertDescription className="text-sm">
                {searchParams.get('saved') === '1' ? (
                  <>
                    Tarlan kaydedildi. Bu alanı artık sürekli takip edebilirim —{' '}
                    <strong className="text-foreground">{activeFieldGreeting.fieldName}</strong>
                    {activeFieldGreeting.crop ? ` (${activeFieldGreeting.crop})` : ''}.
                  </>
                ) : (
                  <>
                    <strong className="text-foreground">{activeFieldGreeting.fieldName}</strong>
                    {activeFieldGreeting.crop ? ` (${activeFieldGreeting.crop})` : ''} tarlasını
                    takip ediyorum
                    {greetingLocation ? (
                      <>
                        {' '}
                        — <strong className="text-foreground">{greetingLocation}</strong>
                      </>
                    ) : null}
                    . Tarla bağlamı, vakalar ve geçmiş hazır.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          {activeCaseId && (
            <Alert className="mb-4 border-primary/25 bg-primary/5">
              <AlertDescription className="text-sm">
                <strong className="text-primary">Bu vaka takip ediliyor.</strong>{' '}
                Yeni teşhis ve öneriler bu vakaya kaydedilir.{' '}
                <Link
                  href={`/cases/${activeCaseId}`}
                  className="font-medium text-primary hover:underline"
                >
                  Vaka Takibini Gör
                </Link>
              </AlertDescription>
            </Alert>
          )}
          {fields.length > 0 && (
            <div className="mb-4 px-1">
              <FieldContextSelector
                fields={fields}
                value={selectedFieldId}
                onChange={setSelectedFieldId}
                locale={conversationLanguage}
              />
            </div>
          )}
          {selectedFieldId && hasChat && (
            <div className="mb-4 px-1">
              <PremiumReportsPanel fieldId={selectedFieldId} caseId={activeCaseId} />
            </div>
          )}
          <OutcomeFollowUpPanel language={conversationLanguage} />
        </div>
        {!hasChat ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
            <AiChatHero
              headline={
                activeFieldGreeting
                  ? doctorCopy.heroMonitoring(activeFieldGreeting.fieldName)
                  : doctorCopy.heroTitle
              }
              subheadline={
                activeFieldGreeting
                  ? doctorCopy.heroSubField(activeFieldGreeting.fieldName, greetingLocation)
                  : doctorCopy.heroSub
              }
            >
              <AiChatComposer
                centered
                value={query}
                onChange={setQuery}
                onSubmit={handleSubmit}
                loading={loading}
                disabled={limitReached}
                placeholder={doctorCopy.placeholder}
                language={conversationLanguage}
                fileRef={fileRef}
                onImageChange={handleImageChange}
                imagePreview={imagePreview}
                onClearImage={() => {
                  setImagePreview(null);
                  setImageMime(null);
                }}
                footerNote={
                  usageHint ? (
                    <p className="text-xs text-muted-foreground">{usageHint}</p>
                  ) : null
                }
              />
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {doctorCopy.examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setQuery(prompt)}
                    className="rounded-full border border-border/80 bg-card px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </AiChatHero>
          </div>
        ) : (
          <div className="chat-container flex-1 space-y-6 py-8 pb-28">
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
                      language={conversationLanguage}
                      hasImage={messages
                        .slice(0, msgIndex)
                        .some((m) => m.role === 'user' && Boolean(m.imageUrl))}
                      evidenceSlot={
                        msg.evidenceCards?.length ? (
                          <EvidenceCardsPanel
                            cards={msg.evidenceCards}
                            language={conversationLanguage}
                            hideHeading
                          />
                        ) : null
                      }
                    />
                    {msg.analysisId ? (
                      <DoctorFeedbackButtons
                        analysisId={msg.analysisId}
                        memoryEventId={msg.memoryEventId}
                        language={msg.diagnosis.language ?? conversationLanguage}
                        feedbackUrl="/api/ai/feedback"
                      />
                    ) : null}
                  </div>
                ) : msg.role === 'assistant' ? (
                  <div className="max-w-[85%] rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm shadow-sm">
                    <p className="whitespace-pre-wrap text-foreground">{msg.content}</p>
                  </div>
                ) : (
                  <div className="chat-message-user max-w-[85%]">
                    {msg.imageUrl && (
                      <ChatMessageImage
                        src={msg.imageUrl}
                        onOpen={() => setLightboxSrc(msg.imageUrl!)}
                      />
                    )}
                    {msg.content && msg.content !== photoUploadedLabel && msg.content !== 'Photo uploaded' && (
                      <p className={msg.imageUrl ? 'mt-2' : undefined}>{msg.content}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {showPhotoQuickActions && (
              <div className="flex flex-wrap gap-2 px-1">
                {photoQuickActions.map((action) => (
                  <Button
                    key={action}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      const pending = pendingPhotoRef.current;
                      void submitQuestion(
                        action,
                        pending?.data ?? imagePreview,
                        pending?.mime ?? imageMime
                      );
                    }}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            )}
            {loading && (
              <AiChatThinking
                label={doctorCopy.thinking}
                steps={doctorCopy.thinkingSteps}
                language={conversationLanguage}
              />
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {(error || limitReached) && (
          <div className="chat-container pb-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  <span>{error}</span>
                  {uploadRetryable && lastRequestRef.current && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => {
                        const last = lastRequestRef.current;
                        if (!last) return;
                        void submitQuestion(
                          last.text || query,
                          last.image ?? imagePreview,
                          last.mime ?? imageMime
                        );
                      }}
                    >
                      {doctorCopy.retry}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {limitReached && (
              <Alert className="mt-3">
                <AlertDescription>
                  {doctorCopy.noAnalyses}{' '}
                  <Link href="/account" className="font-medium underline">
                    {doctorCopy.upgradeAccount}
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        </div>

        <DoctorIntelligencePanel
          language={conversationLanguage}
          evidenceCards={latestEvidence}
          hasFieldProfile={hasFieldProfile}
          onUploadPhoto={() => fileRef.current?.click()}
          onCreateCase={() => openDrawer('cases')}
          mobileOpen={evidenceOpen}
          onMobileClose={() => setEvidenceOpen(false)}
        />
      </div>
      <ChatImageLightbox
        src={lightboxSrc ?? ''}
        open={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
      />
    </AiChatShell>
  );
}
