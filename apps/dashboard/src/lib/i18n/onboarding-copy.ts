import type { OrganizationType } from '@nertura/types';
import type { SiteType } from '@nertura/ai';

import type { DashboardLocale } from './dashboard-copy';
import type { OnboardingWizardState } from '@/lib/onboarding/types';
import { CROP_OPTIONS, SITE_TYPE_OPTIONS } from '@/lib/onboarding/types';

export type OnboardingLocale = DashboardLocale;

const COPY = {
  tr: {
    layout: {
      subtitle: 'Tarım Profili Kurulumu',
      stepOf: (current: number, total: number) => `Adım ${current} / ${total}`,
    },
    steps: [
      { id: 'welcome' as const, label: 'Başlangıç' },
      { id: 'organization' as const, label: 'İşletme' },
      { id: 'location' as const, label: 'Konum' },
      { id: 'site' as const, label: 'Alan Tipi' },
      { id: 'crops' as const, label: 'Ürünler' },
      { id: 'confirm' as const, label: 'Onay' },
    ],
    welcome: {
      title: 'Nertura\'ya hoş geldiniz',
      subtitle:
        'AI Doktor, bölgenizi ve ürünlerinizi bilirse size daha doğru öneriler verir.',
      bannerTitle: 'Tarım Profilinizi Oluşturun',
      bannerBody:
        'Konum, ürün ve üretim bilgileriniz her AI Doktor cevabında arka planda kullanılır.',
      features: [
        { title: 'Bölgeye göre öneriler', desc: 'İklim ve hastalık bağlamı' },
        { title: 'Üretim tipinize uygun cevaplar', desc: 'Tarla, sera veya bahçe' },
        { title: 'Ürüne özel analiz', desc: 'Seçtiğiniz ürünler için' },
      ],
    },
    organization: {
      title: 'İşletme Bilgileri',
      description: 'Çiftliğinizi, bahçenizi veya tarımsal işletmenizi nasıl adlandıralım?',
      orgName: 'İşletme adı',
      orgNamePlaceholder: 'Örn. Anadolu Vadisi Çiftliği',
      orgSlug: 'Kısa bağlantı',
      orgSlugPlaceholder: 'anadolu-vadisi-ciftligi',
      orgType: 'İşletme tipi',
    },
    orgTypes: {
      farm: 'Çiftlik',
      cooperative: 'Kooperatif',
      ag_company: 'Tarım şirketi',
      supplier: 'Tedarikçi',
      exporter: 'İhracatçı',
    } satisfies Record<OrganizationType, string>,
    location: {
      title: 'Konum ve Bölge',
      description: 'AI Doktor, bölgesel hastalık riski ve iklim bilgisini cevaplarına ekler.',
      country: 'Ülke',
      city: 'Şehir',
      district: 'İlçe / Bölge',
      latitude: 'Enlem',
      longitude: 'Boylam',
      cityPlaceholder: 'Ankara',
      districtPlaceholder: 'Çankaya',
    },
    site: {
      title: 'Üretim alanınız nedir?',
      description: 'Tarla, sera veya bahçe tipini seçin.',
      totalArea: 'Toplam alan',
      unit: 'Birim',
      areaPlaceholder: '12',
      boundaryReady: 'Haritada tarla sınırı çizildi — uydu / NDVI entegrasyonuna hazır.',
      units: { donum: 'Dönüm', hectare: 'Hektar', acre: 'Akre' },
    },
    siteTypes: {
      field: {
        label: 'Açık Tarla',
        description: 'Buğday, mısır, pamuk gibi geniş alan üretimi.',
      },
      greenhouse: {
        label: 'Sera',
        description: 'Sebze, fide ve kontrollü üretim alanları.',
      },
      orchard: {
        label: 'Bahçe',
        description: 'Zeytin, üzüm, narenciye ve meyve ağaçları.',
      },
    } satisfies Record<SiteType, { label: string; description: string }>,
    crops: {
      title: 'Ne yetiştiriyorsunuz?',
      description: 'AI Doktor, seçtiğiniz ürünleri analizlerde önceliklendirir.',
      selected: (n: number) => `${n} ürün seçildi`,
    },
    confirm: {
      title: 'Kontrol et ve başla',
      description:
        'Tarım profilinizi kontrol edin. İsterseniz daha sonra ayarlardan güncelleyebilirsiniz.',
      modulesTitle: 'Zeka modülleri',
      summary: {
        organization: 'İşletme',
        type: 'İşletme tipi',
        location: 'Konum',
        coordinates: 'Koordinatlar',
        site: 'Alan tipi',
        area: 'Alan',
        crops: 'Ürünler',
      },
    },
    nav: {
      back: 'Geri',
      continue: 'Devam et',
      getStarted: 'Başla',
      settingUp: 'Kurulum yapılıyor…',
      startDoctor: 'AI Doktor\'a Başla',
    },
    validation: {
      orgNameRequired: 'İşletme adı gerekli',
      invalidSlug: 'Geçersiz kısa bağlantı',
      cityRequired: 'Şehir gerekli',
      locationRequired: 'Haritada konum seçin',
      areaRequired: 'Alan büyüklüğünü girin',
      cropsRequired: 'En az bir ürün seçin',
    },
    errors: {
      setupFailed: 'Kurulum başarısız',
      network: 'Bağlantı hatası. Lütfen tekrar deneyin.',
    },
    intelligence: {
      status: {
        ready: 'Aktif',
        placeholder: 'API Hazır',
        future: 'Yakında',
      },
      climate: {
        title: 'İklim Profili',
        summaryWithLoc: (loc: string) =>
          `${loc} için bölgesel iklim profili. Canlı hava API entegrasyonu hazır.`,
        summaryEmpty: 'Konum seçerek bölgesel iklim bağlamını açın.',
      },
      soil: {
        title: 'Toprak Zekâsı',
        summary: (loc: string) =>
          `${loc || 'koordinatlarınız'} için toprak tipi ve pH tahminleri coğrafi API\'lerden yüklenecek.`,
      },
      diseaseRisk: {
        title: 'Bölgesel Hastalık Riski',
        summary: (crops: string, country: string) =>
          `${country} bölgesinde ${crops} için risk modelleri — Bilgi Bankası ve mevsim verisiyle.`,
      },
      cropCalendar: {
        title: 'Ürün Takvimi',
        summary: (crops: string) => `${crops} için ekim ve hasat pencereleri.`,
      },
      satellite: {
        title: 'Uydu / NDVI',
        summary: 'Tarla sınırı kaydedildi. NDVI ve uydu sağlık haritaları — yakında.',
      },
      cropsFallback: 'ürünleriniz',
    },
    map: {
      mapReady: 'Harita hazır',
      pinDraw: 'Haritada konum seç · Sınır çizim modu',
      pinMode: 'Konum modu',
      drawField: 'Tarla çiz',
      ariaMap: 'Harita — çiftlik konumunu seçmek için tıklayın',
      pinHelp: 'Haritada konumunuzu seçin veya koordinatları girin.',
      drawHelp: 'Tarla sınırını çizmek için haritaya tıklayın.',
      useMyLocation: 'Konumumu kullan',
      pickOnMap: 'Haritada seç',
    },
    countries: {
      TR: 'Türkiye',
      US: 'Amerika Birleşik Devletleri',
      DE: 'Almanya',
      GB: 'Birleşik Krallık',
      NL: 'Hollanda',
      ES: 'İspanya',
    },
    pageMeta: {
      title: 'Kurulum — Nertura',
      description: 'Tarım zeka profilinizi birkaç dakikada oluşturun.',
    },
  },
  en: {
    layout: {
      subtitle: 'Intelligence Setup',
      stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
    },
    steps: [
      { id: 'welcome' as const, label: 'Welcome' },
      { id: 'organization' as const, label: 'Organization' },
      { id: 'location' as const, label: 'Location' },
      { id: 'site' as const, label: 'Site' },
      { id: 'crops' as const, label: 'Crops' },
      { id: 'confirm' as const, label: 'Confirm' },
    ],
    welcome: {
      title: 'Welcome to Nertura',
      subtitle: 'AI Doctor gives better answers when it knows your region and crops.',
      bannerTitle: 'Build Your Agriculture Profile',
      bannerBody: 'Location, crops, and production data power every AI Doctor answer.',
      features: [
        { title: 'Regional guidance', desc: 'Climate and disease context' },
        { title: 'Operation-fit answers', desc: 'Field, greenhouse, or orchard' },
        { title: 'Crop-specific analysis', desc: 'For your selected crops' },
      ],
    },
    organization: {
      title: 'Organization details',
      description: 'How should we identify your farm or agribusiness?',
      orgName: 'Organization name',
      orgNamePlaceholder: 'Anatolian Valley Farm',
      orgSlug: 'URL slug',
      orgSlugPlaceholder: 'anatolian-valley-farm',
      orgType: 'Organization type',
    },
    orgTypes: {
      farm: 'Farm',
      cooperative: 'Cooperative',
      ag_company: 'Agriculture company',
      supplier: 'Supplier',
      exporter: 'Exporter',
    } satisfies Record<OrganizationType, string>,
    location: {
      title: 'Location & region',
      description: 'AI Doctor adds regional disease risk and climate to answers.',
      country: 'Country',
      city: 'City',
      district: 'District / Province',
      latitude: 'Latitude',
      longitude: 'Longitude',
      cityPlaceholder: 'Ankara',
      districtPlaceholder: 'District',
    },
    site: {
      title: 'What is your production site?',
      description: 'Choose field, greenhouse, or orchard type.',
      totalArea: 'Total area',
      unit: 'Unit',
      areaPlaceholder: '12.5',
      boundaryReady: 'Field boundary drawn — ready for satellite / NDVI.',
      units: { donum: 'Dönüm', hectare: 'Hectares (ha)', acre: 'Acres' },
    },
    siteTypes: {
      field: { label: 'Open field', description: 'Broad-acre row crops and grains.' },
      greenhouse: { label: 'Greenhouse', description: 'Vegetables and controlled production.' },
      orchard: { label: 'Orchard', description: 'Trees, vines, permanent plantings.' },
    } satisfies Record<SiteType, { label: string; description: string }>,
    crops: {
      title: 'What do you grow?',
      description: 'AI Doctor prioritizes selected crops in analyses.',
      selected: (n: number) => `${n} crop${n === 1 ? '' : 's'} selected`,
    },
    confirm: {
      title: 'Review and start',
      description: 'Review your profile. You can update it later in settings.',
      modulesTitle: 'Intelligence modules',
      summary: {
        organization: 'Organization',
        type: 'Type',
        location: 'Location',
        coordinates: 'Coordinates',
        site: 'Site',
        area: 'Area',
        crops: 'Crops',
      },
    },
    nav: {
      back: 'Back',
      continue: 'Continue',
      getStarted: 'Get started',
      settingUp: 'Setting up…',
      startDoctor: 'Start AI Doctor',
    },
    validation: {
      orgNameRequired: 'Organization name is required',
      invalidSlug: 'Invalid URL slug',
      cityRequired: 'City is required',
      locationRequired: 'Set a location on the map',
      areaRequired: 'Enter your farm or site size',
      cropsRequired: 'Select at least one crop',
    },
    errors: {
      setupFailed: 'Setup failed',
      network: 'Network error. Please try again.',
    },
    intelligence: {
      status: { ready: 'Active', placeholder: 'API ready', future: 'Coming soon' },
      climate: {
        title: 'Climate profile',
        summaryWithLoc: (loc: string) => `Regional climate baseline for ${loc}.`,
        summaryEmpty: 'Set your location to unlock climate context.',
      },
      soil: {
        title: 'Soil intelligence',
        summary: (loc: string) => `Soil estimates for ${loc || 'your coordinates'}.`,
      },
      diseaseRisk: {
        title: 'Regional disease risk',
        summary: (crops: string, country: string) => `Risk models for ${crops} in ${country}.`,
      },
      cropCalendar: {
        title: 'Crop calendar',
        summary: (crops: string) => `Planting and harvest windows for ${crops}.`,
      },
      satellite: {
        title: 'Satellite / NDVI',
        summary: 'Field boundary saved. NDVI maps — coming soon.',
      },
      cropsFallback: 'your crops',
    },
    map: {
      mapReady: 'Map ready',
      pinDraw: 'Click map to set pin · Draw field boundary',
      pinMode: 'Pin mode',
      drawField: 'Draw field',
      ariaMap: 'Map — click to set farm location',
      pinHelp: 'Select your location on the map or enter coordinates.',
      drawHelp: 'Click the map to draw your field boundary.',
      useMyLocation: 'Use my location',
      pickOnMap: 'Pick on map',
    },
    countries: {
      TR: 'Turkey',
      US: 'United States',
      DE: 'Germany',
      GB: 'United Kingdom',
      NL: 'Netherlands',
      ES: 'Spain',
    },
    pageMeta: {
      title: 'Setup — Nertura',
      description: 'Configure your agriculture intelligence profile.',
    },
  },
} as const;

export type OnboardingCopy = (typeof COPY)[OnboardingLocale];

export function getOnboardingCopy(locale: OnboardingLocale = 'tr'): OnboardingCopy {
  return COPY[locale];
}

export function getCropLabel(cropId: string, locale: OnboardingLocale = 'tr'): string {
  const crop = CROP_OPTIONS.find((c) => c.id === cropId);
  if (!crop) return cropId;
  return locale === 'tr' ? crop.labelTr : crop.label;
}

export function getSiteTypeLabel(siteType: SiteType, locale: OnboardingLocale = 'tr'): string {
  const copy = getOnboardingCopy(locale);
  return copy.siteTypes[siteType].label;
}

export function getOrgTypeLabel(type: OrganizationType, locale: OnboardingLocale = 'tr'): string {
  return getOnboardingCopy(locale).orgTypes[type];
}

export function getRegionalIntelligenceHints(
  state: OnboardingWizardState,
  locale: OnboardingLocale = 'tr'
) {
  const copy = getOnboardingCopy(locale).intelligence;
  const loc = [state.district, state.city, state.countryCode].filter(Boolean).join(', ');
  const crops =
    state.crops.length > 0
      ? state.crops.map((id) => getCropLabel(id, locale)).join(', ')
      : copy.cropsFallback;

  return {
    climate: {
      title: copy.climate.title,
      status: 'ready' as const,
      summary: loc ? copy.climate.summaryWithLoc(loc) : copy.climate.summaryEmpty,
    },
    soil: {
      title: copy.soil.title,
      status: 'placeholder' as const,
      summary: copy.soil.summary(loc || ''),
    },
    diseaseRisk: {
      title: copy.diseaseRisk.title,
      status: 'ready' as const,
      summary: copy.diseaseRisk.summary(crops, state.countryCode),
    },
    cropCalendar: {
      title: copy.cropCalendar.title,
      status: 'ready' as const,
      summary: copy.cropCalendar.summary(crops),
    },
    satellite: {
      title: copy.satellite.title,
      status: 'future' as const,
      summary: copy.satellite.summary,
    },
  };
}

/** Convert dönüm to hectare for backend when schema only stores ha/acre. */
export function toBackendArea(
  farmSize: number,
  areaUnit: 'donum' | 'hectare' | 'acre'
): { farmSize: number; areaUnit: 'hectare' | 'acre' } {
  if (areaUnit === 'donum') {
    return { farmSize: farmSize * 0.1, areaUnit: 'hectare' };
  }
  return { farmSize, areaUnit };
}

export function formatAreaDisplay(
  farmSize: number | null,
  areaUnit: string,
  locale: OnboardingLocale = 'tr'
): string {
  if (!farmSize) return '—';
  const units = getOnboardingCopy(locale).site.units;
  const label =
    areaUnit === 'donum'
      ? units.donum
      : areaUnit === 'acre'
        ? units.acre
        : units.hectare;
  return `${farmSize} ${label}`;
}
