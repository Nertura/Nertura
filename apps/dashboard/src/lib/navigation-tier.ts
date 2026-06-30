import type { LucideIcon } from 'lucide-react';

import {

  BarChart3,

  CalendarDays,

  History,

  Map,

  Settings,

  Stethoscope,

  Tractor,

  User,

} from 'lucide-react';



import { CASE_TRACKING_NAV_FUTURE, HISTORY_NAV_CURRENT } from '@/lib/navigation-cases';
import { planToSubscriptionTier, type BillingTier } from '@/lib/billing/tier-resolver';

export type SubscriptionTier = BillingTier;

export interface TierNavItem {

  href: string;

  label: string;

  icon: LucideIcon;

  shortLabel?: string;

  /** Visible but requires Plus — opens upgrade modal when locked */

  plusOnly?: boolean;

}



/** Free-tier navigation (Book 05 prep — billing not wired yet). */

export const FREE_TIER_NAV: TierNavItem[] = [

  { href: '/doctor', label: 'AI Doktor', shortLabel: 'Doktor', icon: Stethoscope },

  { href: '/account', label: 'Profil', shortLabel: 'Profil', icon: User },

  { href: '/settings', label: 'Ayarlar', shortLabel: 'Ayarlar', icon: Settings },

];



/** Plus-tier items — visible with lock for free users. */

export const PLUS_TIER_NAV: TierNavItem[] = [

  { href: '/history', label: 'Analizlerim', shortLabel: 'Analiz', icon: History, plusOnly: true },

  { href: '/farms', label: 'Tarlalarım', shortLabel: 'Tarla', icon: Tractor, plusOnly: true },

  { href: '/analytics', label: 'İstatistikler', shortLabel: 'İstatistik', icon: Map, plusOnly: true },

  { href: '/weather', label: 'Hava Durumu', shortLabel: 'Hava', icon: CalendarDays, plusOnly: true },

  { href: '/knowledge', label: 'Bilgi Bankası', shortLabel: 'Bilgi', icon: BarChart3, plusOnly: true },

];



export function getTierNavigation(tier: SubscriptionTier): TierNavItem[] {

  const doctor = FREE_TIER_NAV[0];

  const tail = FREE_TIER_NAV.filter((item) => item.href !== '/doctor');



  if (tier === 'plus') {

    return [

      doctor,

      { ...CASE_TRACKING_NAV_FUTURE, plusOnly: false },

      { ...HISTORY_NAV_CURRENT, plusOnly: false },

      ...PLUS_TIER_NAV.filter((item) => item.href !== '/history'),

      ...tail,

    ];

  }



  return [

    doctor,

    { ...CASE_TRACKING_NAV_FUTURE, plusOnly: true },

    { ...HISTORY_NAV_CURRENT, plusOnly: true },

    ...PLUS_TIER_NAV.filter((item) => item.href !== '/history').map((item) => ({

      ...item,

      plusOnly: true,

    })),

    ...tail,

  ];

}



export function isNavItemLocked(item: TierNavItem, tier: SubscriptionTier): boolean {

  return item.plusOnly === true && tier !== 'plus';

}



/** Resolve tier from context, subscription metadata, or dev override. Defaults free. */
export function resolveUserTier(ctx?: {
  organizationId?: string;
  tier?: SubscriptionTier;
  plan?: string | null;
  status?: string | null;
}): SubscriptionTier {
  if (process.env.NEXT_PUBLIC_NERTURA_DEV_TIER === 'plus') return 'plus';
  if (ctx?.tier) return ctx.tier;
  if (ctx?.plan !== undefined || ctx?.status !== undefined) {
    return planToSubscriptionTier(ctx.plan ?? null, ctx.status ?? null);
  }
  return 'free';
}



export const UPGRADE_COPY = {

  title: 'Nertura Plus ile AI Doktor sizi ve tarlanızı hatırlar.',

  features: [

    'Vaka takibi',

    'Analiz geçmişi',

    'Tarla hafızası',

    'Risk uyarıları',

    'Takvim',

    'PDF raporları',

  ] as const,

  cta: 'Nertura Plus\'a Geç',

  dismiss: 'Şimdilik devam et',

} as const;

