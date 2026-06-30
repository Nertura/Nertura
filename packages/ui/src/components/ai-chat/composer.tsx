'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ImagePlus, Loader2, X } from 'lucide-react';
import type { ChangeEvent, FormEvent, ReactNode, RefObject } from 'react';

import { getDoctorUiCopy, type UiLanguage } from '../../lib/i18n/doctor-ui-copy';
import { cn } from '../../lib/utils';
import { AppComposerShell, AppTextarea, composerTextareaClassName } from '../app';
import { Button } from '../button';

interface AiChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  fileRef: RefObject<HTMLInputElement | null>;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  onClearImage: () => void;
  footerNote?: ReactNode;
  className?: string;
  centered?: boolean;
  photoConsentHref?: string;
  language?: UiLanguage;
}

export function AiChatComposer({
  value,
  onChange,
  onSubmit,
  loading,
  disabled,
  placeholder,
  fileRef,
  onImageChange,
  imagePreview,
  onClearImage,
  footerNote,
  className,
  centered = false,
  photoConsentHref = 'https://nertura.com/photo-consent',
  language = 'tr',
}: AiChatComposerProps) {
  const copy = getDoctorUiCopy(language).composer;

  return (
    <div
      className={cn(
        centered ? 'w-full max-w-[860px] mx-auto px-3 sm:px-4' : 'sticky bottom-0 border-t border-border/60 bg-gradient-to-t from-background via-background/95 to-transparent pb-[max(1rem,env(safe-area-inset-bottom))] pt-4',
        className
      )}
    >
      <div className={cn(!centered && 'chat-container')}>
        {footerNote && <div className="mb-3 text-center">{footerNote}</div>}

        <p className="mb-2 text-center text-[11px] leading-relaxed text-muted-foreground">
          {copy.photoConsentShort}{' '}
          <a
            href={photoConsentHref}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.photoConsentLink}
          </a>
        </p>

        {imagePreview && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border bg-card p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt={copy.photoPreviewAlt} className="h-14 w-14 rounded-lg object-cover" />
            <span className="flex-1 text-xs text-muted-foreground">{copy.photoAttached}</span>
            <Button type="button" variant="ghost" size="icon" onClick={onClearImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <AppComposerShell onSubmit={onSubmit}>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
            className="hidden"
            onChange={onImageChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
            onClick={() => fileRef.current?.click()}
            disabled={disabled || loading}
            aria-label={copy.uploadPhoto}
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
          <AppTextarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? copy.placeholder}
            disabled={disabled || loading}
            rows={1}
            className={composerTextareaClassName}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
            disabled={disabled || loading || (!value.trim() && !imagePreview)}
            aria-label={copy.send}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </AppComposerShell>
      </div>
    </div>
  );
}

export function AiChatThinking({
  label,
  detail,
  steps,
  language = 'tr',
}: {
  label?: string;
  detail?: string;
  steps?: readonly string[];
  language?: UiLanguage;
}) {
  const copy = getDoctorUiCopy(language).composer;
  const pipelineSteps = steps?.length ? steps : copy.thinkingSteps;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!pipelineSteps?.length || pipelineSteps.length <= 1) return;
    const id = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % pipelineSteps.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [pipelineSteps]);

  const stepDetail =
    pipelineSteps?.length && pipelineSteps.length > 0
      ? pipelineSteps[stepIndex] ?? pipelineSteps[0]
      : detail ?? copy.thinkingDetail;

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-sm shadow-sm animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{label ?? copy.thinking}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{stepDetail}</p>
      </div>
    </div>
  );
}

/** Map API errors to farmer-friendly copy — never expose internals. */
export function friendlyAiError(
  raw: string | undefined,
  language: UiLanguage = 'tr'
): string {
  if (!raw?.trim()) {
    return language === 'tr'
      ? 'Bir sorun oluştu. Lütfen tekrar deneyin.'
      : 'Something went wrong. Please try again.';
  }

  const lower = raw.toLowerCase();

  if (lower.includes('limit') || lower.includes('account')) return raw;
  if (lower.includes('credit')) return raw;

  if (lower.includes('429') || lower.includes('demand') || lower.includes('too many')) {
    return language === 'tr'
      ? 'Yoğunluk var. Lütfen kısa bir süre sonra tekrar deneyin.'
      : 'Our AI is busy right now. Please wait a moment and try again.';
  }

  if (lower.includes('503') || lower.includes('unavailable')) {
    return language === 'tr'
      ? 'AI servisine şu an ulaşılamıyor. Tekrar deneyebilirsiniz.'
      : 'We could not reach the AI service. You can retry shortly.';
  }

  if (
    lower.includes('image file type') ||
    lower.includes('magic bytes') ||
    lower.includes('mime') ||
    lower.includes('unrecognized') ||
    lower.includes('formatı tanınamadı')
  ) {
    return language === 'tr'
      ? 'Fotoğraf formatı tanınamadı. Lütfen JPG, PNG veya WebP olarak tekrar yükleyin.'
      : 'We could not recognize this photo format. Please upload JPG, PNG, or WebP.';
  }

  if (lower.includes('only jpg') || lower.includes('webp') || lower.includes('png')) {
    return language === 'tr'
      ? 'Bu dosya türü desteklenmiyor. JPG, PNG veya WebP fotoğraf yükleyin.'
      : 'This file type is not supported. Please upload a JPG, PNG, or WebP photo.';
  }

  if (lower.includes('5 mb') || lower.includes('too large') || lower.includes('exceeds')) {
    return language === 'tr'
      ? 'Fotoğraf çok büyük. Lütfen 5 MB altında bir görüntü yükleyin.'
      : 'This photo is too large. Please use an image under 5 MB.';
  }

  if (lower.includes('invalid image') || lower.includes('invalid base64') || lower.includes('okunamadı')) {
    return language === 'tr'
      ? 'Fotoğraf okunamadı. Başka bir fotoğraf deneyin veya tekrar yükleyin.'
      : 'We could not read this photo. Try another image or upload again.';
  }

  if (lower.includes('gemini') || lower.includes('api key') || lower.includes('configured')) {
    return language === 'tr'
      ? 'AI rehberliği geçici olarak sınırlı. Lütfen kısa süre sonra tekrar deneyin.'
      : 'AI guidance is temporarily limited. Please try again shortly.';
  }

  return language === 'tr'
    ? 'Bir sorun oluştu. Lütfen tekrar deneyin.'
    : 'Something went wrong. Please try again.';
}
