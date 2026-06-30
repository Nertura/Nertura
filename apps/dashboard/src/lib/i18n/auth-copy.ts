/** Auth UI copy — Turkish default; structured for future i18n (Book 02 Ch. 11). */
export const AUTH_COPY = {
  brandTagline: 'Güvenilir tarım zekâsı',
  brandHeadline: 'Tarım kararlarınız için akıllı rehber.',
  brandBullets: [
    'Fotoğrafla analiz',
    'AI hafıza',
    'Bilimsel kaynaklar',
    'Güvenli veri saklama',
  ] as const,

  login: {
    title: 'Hoş geldiniz',
    description: 'Nertura hesabınıza giriş yapın',
    google: 'Google ile devam et',
    googleLoading: 'Google\'a yönlendiriliyor…',
    emailDivider: 'E-posta ile devam et',
    email: 'E-posta',
    emailPlaceholder: 'ornek@tarim.com',
    password: 'Şifre',
    forgotPassword: 'Şifremi unuttum',
    submit: 'Giriş yap',
    submitting: 'Giriş yapılıyor…',
    noAccount: 'Hesabınız yok mu?',
    createAccount: 'Ücretsiz hesap oluştur',
    errorTitle: 'Giriş başarısız',
    authCallbackFailed: 'Kimlik doğrulama başarısız. Lütfen tekrar deneyin.',
  },

  register: {
    title: 'Ücretsiz hesap oluştur',
    description: '10 analiz hakkı ile başlayın',
    google: 'Google ile devam et',
    emailDivider: 'E-posta ile kayıt ol',
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    password: 'Şifre',
    confirmPassword: 'Şifre tekrar',
    passwordHint: (min: number) => `En az ${min} karakter`,
    submit: 'Ücretsiz hesap oluştur',
    submitting: 'Hesap oluşturuluyor…',
    hasAccount: 'Zaten hesabınız var mı?',
    signIn: 'Giriş yap',
    errorTitle: 'Kayıt başarısız',
    successTitle: 'E-postanızı kontrol edin',
    successBody: (email: string) =>
      `${email} adresine onay bağlantısı gönderdik. Hesabınızı etkinleştirdikten sonra AI Doktor'a devam edebilirsiniz.`,
    successBackToLogin: 'Giriş sayfasına dön',
    consent: {
      prefix: 'Devam ederek',
      terms: 'Kullanım Koşulları',
      and: 've',
      privacy: 'Gizlilik Politikası',
      kvkk: 'KVKK Aydınlatma Metni',
      suffix: '’ni kabul etmiş olursunuz.',
    },
    photoConsentLink: 'Detaylar',
    photoConsent:
      'Fotoğraflarınız yalnızca analiz, güvenlik ve hizmet kalitesi amacıyla işlenir.',
  },

  forgotPassword: {
    title: 'Şifrenizi sıfırlayın',
    description: 'E-posta adresinize sıfırlama bağlantısı gönderelim.',
    email: 'E-posta',
    emailPlaceholder: 'ornek@tarim.com',
    submit: 'Sıfırlama bağlantısı gönder',
    submitting: 'Gönderiliyor…',
    backToLogin: 'Giriş sayfasına dön',
    errorTitle: 'İstek başarısız',
    successTitle: 'E-postanızı kontrol edin',
    successBody: (email: string) =>
      `${email} için kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderdik.`,
  },

  resetPassword: {
    title: 'Yeni şifre belirleyin',
    description: 'Nertura hesabınız için güçlü bir şifre seçin.',
    password: 'Yeni şifre',
    confirmPassword: 'Şifre tekrar',
    submit: 'Şifreyi güncelle',
    submitting: 'Güncelleniyor…',
    errorTitle: 'Güncelleme başarısız',
    successTitle: 'Şifre güncellendi',
    successBody: 'Şifreniz değiştirildi. Artık giriş yapabilirsiniz.',
    continueLogin: 'Giriş yap',
    passwordMismatch: 'Şifreler eşleşmiyor.',
    passwordTooShort: (min: number) => `Şifre en az ${min} karakter olmalıdır.`,
  },

  footer: {
    privacy: 'Gizlilik',
    terms: 'Koşullar',
    contact: 'İletişim',
  },

  phoneLogin: {
    title: 'Telefon ile giriş',
    description: 'Mobil numaranıza gönderilen tek kullanımlık SMS kodu ile giriş yapın.',
    comingSoonTitle: 'Yakında',
    comingSoonBody:
      'Telefon ile giriş; SMS sağlayıcısı, hız sınırlama ve güvenlik doğrulaması tamamlandığında kullanıma açılacaktır.',
    backToLogin: 'Giriş seçeneklerine dön',
    phoneLabel: 'Telefon numarası',
    phonePlaceholder: '+90 5XX XXX XX XX',
    sendCode: 'SMS kodu gönder',
    scaffoldNote:
      'SMS altyapısı etkin. Twilio/sağlayıcı ve CAPTCHA entegrasyonu tamamlanmadan kullanılamaz.',
  },

  loading: 'Yükleniyor…',
} as const;
