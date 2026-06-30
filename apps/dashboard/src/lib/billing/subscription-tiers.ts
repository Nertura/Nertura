/**
 * Subscription architecture — tiers and feature gates.
 * Stripe integration deferred; tiers drive UI locks and upgrade flows only.
 */

export type SubscriptionTierId = 'free' | 'plus' | 'pro' | 'enterprise';

export interface TierDefinition {
  id: SubscriptionTierId;
  name: string;
  tagline: string;
  monthlyPriceTry: number | null;
  analysesPerMonth: number | 'unlimited';
  features: readonly string[];
  lockedFeatureLabels: readonly string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTierId, TierDefinition> = {
  free: {
    id: 'free',
    name: 'Ücretsiz',
    tagline: 'AI Doktor ile hızlı teşhis',
    monthlyPriceTry: 0,
    analysesPerMonth: 10,
    features: [
      '10 analiz hakkı / ay',
      'Metin ve fotoğraf analizi',
      'Temel teşhis ve öneri',
      'Misafir denemesi (pazarlama sitesi)',
    ],
    lockedFeatureLabels: [
      'Analiz geçmişi',
      'Tarla hafızası',
      'Hava uyarıları',
      'PDF raporları',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    tagline: 'Tarlanızı hatırlayan AI Doktor',
    monthlyPriceTry: null,
    analysesPerMonth: 100,
    features: [
      '100 analiz hakkı / ay',
      'Analiz geçmişi',
      'Tarla ve çiftlik hafızası',
      'Hava durumu ve uyarılar',
      'Bilgi bankası erişimi',
      'İstatistik özeti',
    ],
    lockedFeatureLabels: ['PDF raporları', 'Çoklu kullanıcı', 'API erişimi'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Profesyonel çiftlik operasyonları',
    monthlyPriceTry: null,
    analysesPerMonth: 'unlimited',
    features: [
      'Sınırsız analiz',
      'PDF raporları',
      'Gelişmiş istatistikler',
      'Öncelikli destek',
      'Çoklu tarla risk özeti',
    ],
    lockedFeatureLabels: ['Kurumsal SLA', 'Özel entegrasyon'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Kurumsal',
    tagline: 'Kooperatif ve distribütörler için',
    monthlyPriceTry: null,
    analysesPerMonth: 'unlimited',
    features: [
      'Sınırsız analiz ve kullanıcı',
      'Özel bilgi bankası',
      'API ve entegrasyon',
      'Dedicated destek',
      'KVKK / veri işleme sözleşmesi',
    ],
    lockedFeatureLabels: [],
  },
};

/** Feature keys used across the app for tier gating. */
export type GatedFeature =
  | 'history'
  | 'farms'
  | 'field_memory'
  | 'weather'
  | 'analytics'
  | 'knowledge'
  | 'pdf_reports'
  | 'multi_user'
  | 'api_access';

const TIER_FEATURE_ACCESS: Record<SubscriptionTierId, ReadonlySet<GatedFeature>> = {
  free: new Set(),
  plus: new Set(['history', 'farms', 'field_memory', 'weather', 'analytics', 'knowledge']),
  pro: new Set([
    'history',
    'farms',
    'field_memory',
    'weather',
    'analytics',
    'knowledge',
    'pdf_reports',
  ]),
  enterprise: new Set([
    'history',
    'farms',
    'field_memory',
    'weather',
    'analytics',
    'knowledge',
    'pdf_reports',
    'multi_user',
    'api_access',
  ]),
};

export function tierHasFeature(tier: SubscriptionTierId, feature: GatedFeature): boolean {
  return TIER_FEATURE_ACCESS[tier].has(feature);
}

export function minimumTierForFeature(feature: GatedFeature): SubscriptionTierId {
  const order: SubscriptionTierId[] = ['free', 'plus', 'pro', 'enterprise'];
  const match = order.find((id) => tierHasFeature(id, feature));
  return match ?? 'enterprise';
}

/** Comparison rows for upgrade UI */
export const TIER_COMPARISON_ROWS = [
  { label: 'Aylık analiz hakkı', free: '10', plus: '100', pro: 'Sınırsız', enterprise: 'Sınırsız' },
  { label: 'Analiz geçmişi', free: false, plus: true, pro: true, enterprise: true },
  { label: 'Tarla hafızası', free: false, plus: true, pro: true, enterprise: true },
  { label: 'Hava uyarıları', free: false, plus: true, pro: true, enterprise: true },
  { label: 'PDF raporları', free: false, plus: false, pro: true, enterprise: true },
  { label: 'Çoklu kullanıcı', free: false, plus: false, pro: false, enterprise: true },
] as const;
