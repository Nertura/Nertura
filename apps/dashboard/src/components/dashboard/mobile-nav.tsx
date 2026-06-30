'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';

import { cn } from '@nertura/ui';

import { useUpgradeModal } from '@/components/billing/upgrade-modal-provider';
import { isNavActive } from '@/lib/navigation';
import { getTierNavigation, isNavItemLocked } from '@/lib/navigation-tier';
import { useSubscriptionTier } from '@/components/dashboard/tier-provider';

const MOBILE_HREFS = ['/doctor', '/cases', '/history', '/account'] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { openUpgrade } = useUpgradeModal();
  const tier = useSubscriptionTier();
  const navItems = getTierNavigation(tier).filter((item) =>
    MOBILE_HREFS.includes(item.href as (typeof MOBILE_HREFS)[number])
  );

  if (pathname === '/doctor' || pathname.startsWith('/doctor/')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden pointer-events-auto"
      aria-label="Mobil navigasyon"
    >
      {navItems.map((item) => {
        const locked = isNavItemLocked(item, tier);
        const active = !locked && isNavActive(pathname, item.href);
        const Icon = item.icon;
        const label = item.shortLabel ?? item.label;

        if (locked) {
          return (
            <button
              key={item.href}
              type="button"
              onClick={openUpgrade}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground"
            >
              <Icon className="h-5 w-5" aria-hidden />
              <Lock className="absolute right-[calc(50%-1.25rem)] top-1.5 h-2.5 w-2.5" aria-hidden />
              {label}
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
              active ? 'text-signal' : 'text-muted-foreground'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
