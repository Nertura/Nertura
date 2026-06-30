import { GUEST_QUESTION_LIMIT } from '@nertura/ai';

/** Static marketing copy — safe for server and client imports. */
export const GUEST_DISPLAY_ANALYSIS_LIMIT = GUEST_QUESTION_LIMIT;

export const MARKETING_COPY = {
  tr: {
    headline: 'Dünyanın en gelişmiş AI Tarım Doktoru',
    rotatingPlaceholders: [
      'Zeytin yaprakları neden sararıyor?',
      'Domatesimde kahverengi lekeler var',
      'Ankara\'da salatalık yetişir mi?',
      'Bitkimde ne oluyor?',
    ] as const,
    placeholder: 'Bitkimde ne oluyor?',
    analysisGuest: 'Ücretsiz hesapla 10 analiz hakkı',
    analysisLoggedIn: 'Kalan ücretsiz analiz: 10',
    analysisRemaining: (remaining: number) => `Kalan ücretsiz analiz: ${remaining}`,
    trustSecurity:
      'Verileriniz güvenle korunur. Fotoğraflarınız yalnızca analiz için kullanılır.',
    lockedPhoto: 'Fotoğraf çek',
    lockedGallery: 'Galeriden yükle',
    lockedVoice: 'Sesli sor',
    lockedCancel: 'İptal',
    lockedFooter: 'Tüm özellikleri kullanmak için',
    lockedSignup: 'Ücretsiz hesap oluştur',
    lockedSignupArrow: 'Ücretsiz hesap oluştur →',
    signupPromptTitle: 'Bu özelliği kullanmak için ücretsiz hesap oluşturun.',
    signupPromptBody:
      'Fotoğraf analizi, sesli soru ve analiz geçmişi ücretsiz hesabınızla açılır.',
    signupLimitPromptTitle: 'Ücretsiz analiz hakkınız doldu.',
    signupLimitPromptBody:
      'Devam etmek için ücretsiz hesap oluşturun. Analiz geçmişiniz hesabınızla kaydedilir.',
    signup: 'Ücretsiz hesap oluştur',
    login: 'Giriş yap',
    send: 'Gönder',
    addAction: 'Ekle',
    thinking: 'Nertura analiz ediyor…',
    retry: 'Tekrar dene',
    refreshExamples: 'Yenile',
    trustPrivacy: 'Gizlilik',
    trustKvkk: 'KVKK',
    trustAiDisclaimer: 'AI Sorumluluk',
  },
  en: {
    headline: 'The world’s most advanced AI agriculture doctor',
    rotatingPlaceholders: [
      'Why are my olive leaves turning yellow?',
      'Brown spots on my tomato plants',
      'Can I grow cucumbers in Ankara?',
      'What is happening to my plant?',
    ] as const,
    placeholder: 'Ask about your plant…',
    analysisGuest: '10 free analyses with a free account',
    analysisLoggedIn: 'Free analyses remaining: 10',
    analysisRemaining: (remaining: number) => `Free analyses remaining: ${remaining}`,
    trustSecurity:
      'Your data is kept secure. Photos are used only for analysis.',
    lockedPhoto: 'Take photo 🔒',
    lockedGallery: 'Upload from gallery 🔒',
    lockedVoice: 'Ask by voice 🔒',
    lockedCancel: 'Cancel',
    lockedFooter: 'To use all features',
    lockedSignup: 'Create a free account',
    lockedSignupArrow: 'Create a free account →',
    signupPromptTitle: 'Create a free account to continue.',
    signupPromptBody: 'Save your analysis history and let AI Doctor remember you.',
    signupLimitPromptTitle: 'Your free analyses are used up.',
    signupLimitPromptBody:
      'Create a free account to continue. Your analysis history will be saved to your account.',
    signup: 'Create free account',
    login: 'Log in',
    send: 'Send',
    addAction: 'Add',
    thinking: 'Nertura is analyzing…',
    retry: 'Try again',
    refreshExamples: 'Refresh',
    trustPrivacy: 'Privacy',
    trustKvkk: 'GDPR',
    trustAiDisclaimer: 'AI Disclaimer',
  },
} as const;

export type MarketingCopy = (typeof MARKETING_COPY)['tr'];
