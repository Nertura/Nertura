import { analyzeQuestion } from './question-analyzer';

export type ConversationLanguage = 'tr' | 'en';

const IMAGE_ONLY_PLACEHOLDERS = [
  /^analyze this plant photo\.?$/i,
  /^photo uploaded\.?$/i,
  /^fotoğraf yüklendi\.?$/i,
  /^foto yuklendi\.?$/i,
];

/** Map locale / profile language to doctor conversation language. */
export function normalizeLocaleToLanguage(
  locale: string | null | undefined
): ConversationLanguage | null {
  if (!locale?.trim()) return null;
  const base = locale.trim().toLowerCase().split('-')[0];
  if (base === 'tr') return 'tr';
  if (base === 'en') return 'en';
  return null;
}

/** Parse Accept-Language header (highest weighted tr/en wins). */
export function parseAcceptLanguage(header: string | null | undefined): ConversationLanguage | null {
  if (!header?.trim()) return null;

  const parts = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const weight = qParam ? parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag?.trim() ?? '', weight: Number.isFinite(weight) ? weight : 0 };
    })
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of parts) {
    const lang = normalizeLocaleToLanguage(tag);
    if (lang) return lang;
  }
  return null;
}

/** GeoIP hint — only infer Turkish from country; do not infer English from geo. */
export function countryToLanguage(countryCode: string | null | undefined): ConversationLanguage | null {
  if (!countryCode?.trim()) return null;
  if (countryCode.trim().toUpperCase() === 'TR') return 'tr';
  return null;
}

export function resolveInitialConversationLanguage(sources: {
  profileLanguage?: string | null;
  conversationLanguage?: ConversationLanguage | null;
  acceptLanguage?: string | null;
  messageLanguage?: ConversationLanguage | null;
}): ConversationLanguage {
  return (
    normalizeLocaleToLanguage(sources.profileLanguage) ??
    sources.conversationLanguage ??
    sources.messageLanguage ??
    parseAcceptLanguage(sources.acceptLanguage) ??
    'tr'
  );
}

/** Initial resolution only — never used to override a locked conversation language. */
export function detectMessageLanguage(message: string): ConversationLanguage | null {
  const trimmed = message.trim();
  if (!trimmed) return null;
  return analyzeQuestion(trimmed).language;
}

export const PHOTO_QUICK_ACTIONS: Record<ConversationLanguage, string[]> = {
  tr: [
    'Hastalık nedir?',
    'Neden oldu?',
    'Nasıl iyileşir?',
    'Gübre önerisi',
    'Zararlı kontrolü',
  ],
  en: [
    'What disease is this?',
    'What caused it?',
    'How can I treat it?',
    'Fertilizer advice',
    'Pest control',
  ],
};

/** Explicit user request to change conversation language. */
export function detectExplicitLanguageSwitch(
  message: string
): ConversationLanguage | null {
  const q = message.trim();
  if (!q) return null;

  const englishRequest =
    /\b(please\s+)?(answer|respond|reply|write|speak|switch)\s+(in\s+)?english\b/i.test(q) ||
    /\benglish\s+(please|only|cevap|yanit)\b/i.test(q) ||
    /\bingilizce\s+(cevap|yanit|yaz|konuş|konus)(?:la|ın|in)?\b/i.test(q);

  const turkishRequest =
    /\b(please\s+)?(answer|respond|reply|write|speak|switch)\s+(in\s+)?turkish\b/i.test(q) ||
    /\bturkish\s+(please|only)\b/i.test(q) ||
    /\btürkçe\s+(cevap|yanit|yaz|konuş|konus)(?:la|ın|in)?\b/i.test(q) ||
    /\bturkce\s+(cevap|yanit|yaz|konus)(?:la|in)?\b/i.test(q);

  if (englishRequest && !turkishRequest) return 'en';
  if (turkishRequest && !englishRequest) return 'tr';
  return null;
}

export function isImageOnlySubmission(message: string, hasImage: boolean): boolean {
  if (!hasImage) return false;
  const trimmed = message.trim();
  if (!trimmed) return true;
  return IMAGE_ONLY_PLACEHOLDERS.some((re) => re.test(trimmed));
}

export function getImageOnlyPrompt(language: ConversationLanguage): string {
  if (language === 'tr') {
    return 'Fotoğraf yüklendi.\n\nBu fotoğraf hakkında ne öğrenmek istiyorsunuz?';
  }
  return 'Photo uploaded.\n\nWhat would you like to know about this photo?';
}

/** Strict lock block injected into every LLM call. */
export function buildStrictLanguageBlock(language: ConversationLanguage): string {
  if (language === 'tr') {
    return [
      'Conversation language: Turkish.',
      'Respond ONLY in Turkish.',
      'Never switch language unless the user explicitly requests another language.',
      'Knowledge Bank excerpts may be in English — translate internally before responding.',
      'Do not infer language from crop names, disease names, or image content.',
    ].join('\n');
  }
  return [
    'Conversation language: English.',
    'Respond ONLY in English.',
    'Never switch language unless the user explicitly requests another language.',
    'Knowledge Bank excerpts may be in another language — translate internally before responding.',
    'Do not infer language from crop names, disease names, or image content.',
  ].join('\n');
}

export function hasKbContentInLanguage(
  hit: { summary_tr?: string | null; summary_en?: string | null; name_tr?: string | null; name_en?: string | null },
  language: ConversationLanguage
): boolean {
  if (language === 'tr') {
    return Boolean(hit.summary_tr?.trim() && hit.name_tr?.trim());
  }
  return Boolean(hit.summary_en?.trim() || hit.name_en?.trim());
}
