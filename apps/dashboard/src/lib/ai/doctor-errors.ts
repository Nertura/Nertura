import { friendlyDoctorError, type ConversationLanguage } from '@nertura/ai';

export type DoctorPipelineStep =
  | 'request_received'
  | 'usage_check'
  | 'image_validation'
  | 'image_upload'
  | 'intelligence_engine'
  | 'conversation_save'
  | 'usage_debit'
  | 'field_case_link'
  | 'complete';

export type DoctorErrorCode =
  | 'usage_limit'
  | 'image_validation'
  | 'image_upload_failed'
  | 'ai_provider_unavailable'
  | 'knowledge_engine_failed'
  | 'conversation_save_failed'
  | 'analysis_save_failed'
  | 'usage_debit_failed'
  | 'rate_limited'
  | 'unauthorized'
  | 'unknown';

export class DoctorRequestError extends Error {
  readonly step: DoctorPipelineStep;
  readonly code: DoctorErrorCode;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(
    step: DoctorPipelineStep,
    code: DoctorErrorCode,
    message: string,
    options?: { retryable?: boolean; cause?: unknown }
  ) {
    super(message);
    this.name = 'DoctorRequestError';
    this.step = step;
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.cause = options?.cause;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

export function isMissingLanguageColumnError(err: unknown): boolean {
  const rec = asRecord(err);
  const message = String(rec?.message ?? err ?? '').toLowerCase();
  return (
    rec?.code === 'PGRST204' &&
    (message.includes("'language'") || message.includes('language column'))
  );
}

export function classifyDoctorFailure(
  err: unknown,
  step: DoctorPipelineStep = 'conversation_save'
): DoctorRequestError {
  if (err instanceof DoctorRequestError) return err;

  const rec = asRecord(err);
  const message = String(rec?.message ?? (err instanceof Error ? err.message : err) ?? '');
  const lower = message.toLowerCase();
  const code = String(rec?.code ?? '');

  if (lower.includes('too many requests') || code === '429') {
    return new DoctorRequestError(step, 'rate_limited', message, { retryable: true, cause: err });
  }

  if (
    lower.includes('gemini') ||
    lower.includes('api key') ||
    lower.includes('503') ||
    lower.includes('502') ||
    lower.includes('ai service')
  ) {
    return new DoctorRequestError(step, 'ai_provider_unavailable', message, {
      retryable: true,
      cause: err,
    });
  }

  if (
    lower.includes('storage') ||
    lower.includes('bucket') ||
    lower.includes('analysis-images') ||
    lower.includes('object not found')
  ) {
    return new DoctorRequestError(step, 'image_upload_failed', message, {
      retryable: true,
      cause: err,
    });
  }

  if (
    isMissingLanguageColumnError(err) ||
    lower.includes('ai_conversations') ||
    lower.includes('ai_messages') ||
    lower.includes('conversation could not be saved') ||
    code.startsWith('PGRST')
  ) {
    return new DoctorRequestError(step, 'conversation_save_failed', message, {
      cause: err,
    });
  }

  if (lower.includes('ai_analyses') || lower.includes('analysis could not be saved')) {
    return new DoctorRequestError(step, 'analysis_save_failed', message, { cause: err });
  }

  if (
    lower.includes('debit_user_credit') ||
    lower.includes('credits') ||
    lower.includes('no credits') ||
    lower.includes('usage')
  ) {
    return new DoctorRequestError(step, 'usage_debit_failed', message, { cause: err });
  }

  if (lower.includes('knowledge') || lower.includes('retrieval')) {
    return new DoctorRequestError(step, 'knowledge_engine_failed', message, {
      retryable: true,
      cause: err,
    });
  }

  return new DoctorRequestError(step, 'unknown', message || 'Doctor request failed', { cause: err });
}

export function userFacingDoctorError(
  err: unknown,
  language: ConversationLanguage = 'tr'
): { message: string; code: DoctorErrorCode; step: DoctorPipelineStep; retryable: boolean; detail?: string } {
  const classified = classifyDoctorFailure(err);
  const raw = classified.message;

  const mapped: Record<DoctorErrorCode, { tr: string; en: string; retryable?: boolean }> = {
    usage_limit: {
      tr: 'Analiz hakkınız kalmadı. Hesabınızı yükseltin veya planınızı kontrol edin.',
      en: 'No analyses remaining. Upgrade your account or check your plan.',
    },
    image_validation: {
      tr: 'Fotoğraf doğrulanamadı. JPG, PNG veya WebP yükleyin.',
      en: 'Photo validation failed. Upload JPG, PNG, or WebP.',
    },
    image_upload_failed: {
      tr: 'Fotoğraf yüklemesi başarısız. Depolama alanı yapılandırmasını kontrol edin.',
      en: 'Image upload failed. Check storage bucket configuration.',
      retryable: true,
    },
    ai_provider_unavailable: {
      tr: 'AI sağlayıcısına ulaşılamıyor. Lütfen kısa süre sonra tekrar deneyin.',
      en: 'AI provider unavailable. Please try again shortly.',
      retryable: true,
    },
    knowledge_engine_failed: {
      tr: 'Bilgi motoru yanıt vermedi. Lütfen tekrar deneyin.',
      en: 'Knowledge engine timed out. Please try again.',
      retryable: true,
    },
    conversation_save_failed: {
      tr: isMissingLanguageColumnError(err)
        ? 'Konuşma kaydedilemedi. Veritabanı migration eksik (ai_conversations.language). supabase db push çalıştırın.'
        : 'Konuşma kaydedilemedi. Lütfen tekrar deneyin.',
      en: isMissingLanguageColumnError(err)
        ? 'Conversation save failed. Missing DB migration (ai_conversations.language). Run supabase db push.'
        : 'Conversation save failed. Please try again.',
    },
    analysis_save_failed: {
      tr: 'Analiz kaydı oluşturulamadı.',
      en: 'Analysis record could not be saved.',
    },
    usage_debit_failed: {
      tr: 'Analiz hakkı düşülemedi. Hesap kullanım limitlerini kontrol edin.',
      en: 'Could not debit analysis allowance. Check account usage limits.',
    },
    rate_limited: {
      tr: 'Çok fazla istek. Lütfen kısa bir süre bekleyin.',
      en: 'Too many requests. Please wait a moment.',
      retryable: true,
    },
    unauthorized: {
      tr: 'Oturum gerekli. Lütfen tekrar giriş yapın.',
      en: 'Sign-in required. Please log in again.',
    },
    unknown: {
      tr: friendlyDoctorError(raw, language),
      en: friendlyDoctorError(raw, 'en'),
    },
  };

  const copy = mapped[classified.code];
  const message = language === 'tr' ? copy.tr : copy.en;

  return {
    message,
    code: classified.code,
    step: classified.step,
    retryable: copy.retryable ?? classified.retryable,
    detail: process.env.NODE_ENV === 'development' ? raw : undefined,
  };
}

export function logDoctorStep(
  step: DoctorPipelineStep,
  detail?: Record<string, unknown>
): void {
  console.info(`[doctor] ✔ ${step}`, detail ?? {});
}

export function logDoctorFailure(
  step: DoctorPipelineStep,
  err: unknown,
  detail?: Record<string, unknown>
): void {
  const classified = classifyDoctorFailure(err, step);
  console.error(`[doctor] ✗ ${step}`, {
    code: classified.code,
    message: classified.message,
    retryable: classified.retryable,
    ...detail,
    cause: asRecord(classified.cause) ?? classified.cause,
  });
}
