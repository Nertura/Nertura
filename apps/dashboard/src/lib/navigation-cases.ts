import type { LucideIcon } from 'lucide-react';
import { ClipboardList, History } from 'lucide-react';

import type { SubscriptionTier, TierNavItem } from '@/lib/navigation-tier';
import { PLUS_TIER_NAV } from '@/lib/navigation-tier';

/**
 * Future navigation — History evolves into Vaka Takibi (case-grouped history).
 * Not active in v1; `/history` route and label unchanged for backward compatibility.
 */
export const CASE_TRACKING_NAV_FUTURE: TierNavItem = {
  href: '/cases',
  label: 'Vaka Takibi',
  shortLabel: 'Vakalar',
  icon: ClipboardList,
  plusOnly: true,
};

/** Current production nav item (unchanged). */
export const HISTORY_NAV_CURRENT: TierNavItem = {
  href: '/history',
  label: 'Analizlerim',
  shortLabel: 'Analiz',
  icon: History,
  plusOnly: true,
};

export function resolveHistoryNavItem(_useCaseTrackingLabel = false): TierNavItem {
  return HISTORY_NAV_CURRENT;
}

export interface CaseNavOptions {
  /** When true, Plus users see Vaka Takibi in nav (future sprint). Default false — History stays primary. */
  enableCaseTrackingNav?: boolean;
}

/**
 * Plus-tier nav with optional Vaka Takibi entry.
 * Free users never receive case tracking nav (only locked Plus items via getTierNavigation).
 */
export function buildPlusTierNavItems(
  tier: SubscriptionTier,
  options: CaseNavOptions = {}
): TierNavItem[] {
  const { enableCaseTrackingNav = false } = options;

  if (!enableCaseTrackingNav || tier !== 'plus') {
    return PLUS_TIER_NAV.map((item) =>
      item.href === '/history' ? { ...HISTORY_NAV_CURRENT, plusOnly: true } : item
    );
  }

  const withoutHistory = PLUS_TIER_NAV.filter((item) => item.href !== '/history');
  return [
    { ...HISTORY_NAV_CURRENT, plusOnly: true },
    { ...CASE_TRACKING_NAV_FUTURE, plusOnly: true },
    ...withoutHistory,
  ];
}
