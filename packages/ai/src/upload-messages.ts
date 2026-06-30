import type { ConversationLanguage } from './conversation-language';

export type ImageValidationErrorCode =
  | 'missing'
  | 'unsupported'
  | 'invalid_data'
  | 'too_large'
  | 'mime_mismatch'
  | 'unrecognized';

const UPLOAD_ERRORS: Record<ImageValidationErrorCode, { tr: string; en: string }> = {
  missing: {
    tr: 'Fotoğraf yüklenemedi. Lütfen tekrar seçin.',
    en: 'We could not read the photo. Please select it again.',
  },
  unsupported: {
    tr: 'Bu dosya türü desteklenmiyor. JPG, PNG veya WebP fotoğraf yükleyin.',
    en: 'This file type is not supported. Please upload a JPG, PNG, or WebP photo.',
  },
  invalid_data: {
    tr: 'Fotoğraf okunamadı. Başka bir fotoğraf deneyin veya tekrar yükleyin.',
    en: 'We could not read this photo. Try another image or upload again.',
  },
  too_large: {
    tr: 'Fotoğraf çok büyük. Lütfen 5 MB altında bir görüntü yükleyin.',
    en: 'This photo is too large. Please use an image under 5 MB.',
  },
  mime_mismatch: {
    tr: 'Fotoğraf formatı tanınamadı. Lütfen JPG, PNG veya WebP olarak tekrar yükleyin.',
    en: 'We could not recognize this photo format. Please upload JPG, PNG, or WebP.',
  },
  unrecognized: {
    tr: 'Fotoğraf formatı tanınamadı. Lütfen JPG, PNG veya WebP olarak tekrar yükleyin.',
    en: 'We could not recognize this photo format. Please upload JPG, PNG, or WebP.',
  },
};

export function userFacingUploadError(
  code: ImageValidationErrorCode,
  language: ConversationLanguage = 'tr'
): string {
  return UPLOAD_ERRORS[code][language];
}

/** Map legacy / technical API error strings to farmer-friendly copy. */
export function friendlyDoctorError(
  raw: string | undefined,
  language: ConversationLanguage = 'tr'
): string {
  if (!raw?.trim()) {
    return language === 'tr'
      ? 'Bir sorun oluştu. Lütfen tekrar deneyin.'
      : 'Something went wrong. Please try again.';
  }

  const lower = raw.toLowerCase();

  if (lower.includes('limit') || lower.includes('credit') || lower.includes('account')) {
    return raw;
  }

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
    lower.includes('unrecognized image')
  ) {
    return userFacingUploadError('unrecognized', language);
  }

  if (lower.includes('only jpg') || lower.includes('webp') || lower.includes('png')) {
    return userFacingUploadError('unsupported', language);
  }

  if (lower.includes('5 mb') || lower.includes('too large') || lower.includes('exceeds')) {
    return userFacingUploadError('too_large', language);
  }

  if (lower.includes('invalid image') || lower.includes('invalid base64')) {
    return userFacingUploadError('invalid_data', language);
  }

  if (
    lower.includes('pgrst') ||
    lower.includes('schema cache') ||
    lower.includes('could not find') ||
    lower.includes('column') ||
    lower.includes('ai_conversations') ||
    lower.includes('conversation could not be saved')
  ) {
    return language === 'tr'
      ? 'Konuşma kaydedilemedi. Veritabanı şemasını kontrol edin (supabase db push).'
      : 'Conversation save failed. Check database schema (supabase db push).';
  }

  if (lower.includes('storage') || lower.includes('bucket') || lower.includes('analysis-images')) {
    return language === 'tr'
      ? 'Fotoğraf yüklemesi başarısız.'
      : 'Image upload failed.';
  }

  if (lower.includes('debit_user_credit') || lower.includes('usage_debit')) {
    return language === 'tr'
      ? 'Analiz hakkı güncellenemedi.'
      : 'Analysis allowance could not be updated.';
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
