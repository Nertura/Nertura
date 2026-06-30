'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ImagePlus, MessageSquarePlus, Send, X } from 'lucide-react';

import type { DoctorDiagnosis } from '@nertura/types';
import { Alert, AlertDescription, Button, Card, CardContent, Input, buttonVariants, cn } from '@nertura/ui';

import { DiagnosisCard } from '@/components/assistant/diagnosis-card';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  diagnosis?: DoctorDiagnosis;
  imagePreview?: string | null;
};

interface AssistantChatProps {
  initialConversationId?: string;
  initialQuery?: string;
  initialMessages?: ChatMessage[];
  autoSend?: boolean;
}

export function AssistantChat({
  initialConversationId,
  initialQuery,
  initialMessages,
  autoSend,
}: AssistantChatProps) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [input, setInput] = useState(initialQuery ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);
  const hydratedRef = useRef(Boolean(initialMessages?.length));

  useEffect(() => {
    if (typeof window === 'undefined' || !initialConversationId || hydratedRef.current) return;
    const raw = sessionStorage.getItem('nertura_doctor_last_result');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        conversationId: string;
        message: ChatMessage;
        usage?: { used: number; limit: number; remaining: number };
      };
      if (parsed.conversationId === initialConversationId) {
        hydratedRef.current = true;
        setConversationId(parsed.conversationId);
        if (parsed.usage) setUsage(parsed.usage);
        const userContent = initialQuery ?? '';
        if (userContent) {
          setMessages([
            {
              id: crypto.randomUUID(),
              role: 'user',
              content: userContent,
              created_at: parsed.message.created_at,
            },
            parsed.message,
          ]);
        } else {
          setMessages([parsed.message]);
        }
        sessionStorage.removeItem('nertura_doctor_last_result');
      }
    } catch {
      // ignore
    }
  }, [initialConversationId, initialQuery]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Sadece JPG, PNG ve WebP desteklenir.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Görsel 5MB altında olmalı.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
      setImageMime(file.type);
    };
    reader.readAsDataURL(file);
  }

  async function sendText(text: string) {
    const trimmed = text.trim();
    if ((!trimmed && !imagePreview) || loading) return;

    setError(null);
    setLoading(true);
    setInput('');

    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed || '[Fotoğraf yüklendi]',
      created_at: new Date().toISOString(),
      imagePreview,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch('/api/ai/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: trimmed || 'Bu bitki fotoğrafını analiz et.',
          imageBase64: imagePreview ?? undefined,
          imageMimeType: imageMime ?? undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.limitReached) setLimitReached(true);
        throw new Error(json.error ?? 'Request failed');
      }

      setConversationId(json.conversationId);
      if (json.usage) setUsage(json.usage);
      setMessages((prev) => [...prev, json.message as ChatMessage]);
      setImagePreview(null);
      setImageMime(null);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoSend && initialQuery && !autoSentRef.current) {
      autoSentRef.current = true;
      void sendText(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend, initialQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendText(input);
  }

  return (
    <Card className="flex h-[calc(100vh-8rem)] flex-col border-0 shadow-none lg:h-[calc(100vh-6rem)]">
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="flex items-center justify-between border-b px-4 py-2">
          {usage ? (
            <p className="text-xs text-muted-foreground">
              Kalan ücretsiz soru: {usage.remaining} / {usage.limit}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">AI Tarım Doktoru</p>
          )}
          <Link href="/doctor" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Yeni Soru
          </Link>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h2 className="text-xl font-semibold text-void">Nertura AI Tarım Doktoru</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Bitki, hastalık, gübre, toprak, sulama veya zararlı hakkında soru sorun.
                Fotoğraf yükleyerek teşhis alabilirsiniz.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && msg.diagnosis ? (
                <DiagnosisCard diagnosis={msg.diagnosis} />
              ) : (
                <div className="max-w-[85%] space-y-2">
                  {msg.imagePreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={msg.imagePreview}
                      alt="Yüklenen görsel"
                      className="max-h-40 rounded-lg border object-cover"
                    />
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-signal/20 text-void'
                        : 'border bg-card text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <p className="text-center text-sm text-muted-foreground">AI analiz ediliyor…</p>
          )}
          <div ref={bottomRef} />
        </div>

        {limitReached && (
          <Alert className="mx-4 mb-2">
            <AlertDescription>
              Ücretsiz soru limitinize ulaştınız. Devam etmek için planınızı yükseltin.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mx-4 mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {imagePreview && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Önizleme" className="h-12 w-12 rounded object-cover" />
            <span className="flex-1 truncate text-xs text-muted-foreground">Fotoğraf eklendi</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setImagePreview(null);
                setImageMime(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileRef.current?.click()}
            disabled={loading || limitReached}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bitkini, hastalığı veya tarım sorununu sor…"
            disabled={loading || limitReached}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || limitReached || (!input.trim() && !imagePreview)}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
