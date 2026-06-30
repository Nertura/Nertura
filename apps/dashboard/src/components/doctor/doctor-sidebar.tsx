'use client';

import Link from 'next/link';
import {
  BarChart3,
  History,
  Lock,
  MessageSquarePlus,
  Settings,
  Sprout,
  Stethoscope,
  Tractor,
} from 'lucide-react';

import { cn, getDoctorUiCopy, type UiLanguage } from '@nertura/ui';

import { useUpgradeModal } from '@/components/billing/upgrade-modal-provider';
import {
  getTierNavigation,
  isNavItemLocked,
  resolveUserTier,
  type TierNavItem,
} from '@/lib/navigation-tier';

interface DoctorSidebarProps {
  language?: UiLanguage;
  tier?: import('@/lib/navigation-tier').SubscriptionTier;
  onNewChat: () => void;
  onOpenHistory: () => void;
  onOpenCases: () => void;
  usage?: { used: number; limit: number; remaining: number } | null;
  className?: string;
}

const SIDEBAR_NAV: Array<{
  key: string;
  labelTr: string;
  href?: string;
  icon: typeof Stethoscope;
  action?: 'history' | 'cases' | 'new';
  plusOnly?: boolean;
}> = [
  { key: 'new', labelTr: 'Yeni sohbet', icon: MessageSquarePlus, action: 'new' },
  { key: 'history', labelTr: 'Sohbet Geçmişi', icon: History, action: 'history' },
  { key: 'cases', labelTr: 'Vaka Takibi', icon: Stethoscope, action: 'cases', plusOnly: true },
  { key: 'fields', labelTr: 'Tarlalarım', href: '/farms', icon: Tractor, plusOnly: true },
  { key: 'crops', labelTr: 'Ürünlerim', href: '/farms', icon: Sprout, plusOnly: true },
  { key: 'reports', labelTr: 'Raporlar', href: '/reports', icon: BarChart3, plusOnly: true },
  { key: 'settings', labelTr: 'Ayarlar', href: '/settings', icon: Settings },
];

function SidebarNavButton({
  item,
  locked,
  active,
  onClick,
  onLockedClick,
}: {
  item: (typeof SIDEBAR_NAV)[number];
  locked: boolean;
  active?: boolean;
  onClick?: () => void;
  onLockedClick: () => void;
}) {
  const Icon = item.icon;
  const className = cn(
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    locked && 'opacity-80'
  );

  if (locked) {
    return (
      <button type="button" onClick={onLockedClick} className={className}>
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 text-left">{item.labelTr}</span>
        <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
      </button>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1">{item.labelTr}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 text-left">{item.labelTr}</span>
    </button>
  );
}

export function DoctorSidebar({
  language = 'tr',
  tier: tierProp,
  onNewChat,
  onOpenHistory,
  onOpenCases,
  usage,
  className,
}: DoctorSidebarProps) {
  const shellCopy = getDoctorUiCopy(language).shell;
  const tier = tierProp ?? resolveUserTier();
  const tierNav = getTierNavigation(tier);
  const { openUpgrade } = useUpgradeModal();

  const isLocked = (item: (typeof SIDEBAR_NAV)[number]) => {
    if (!item.plusOnly) return false;
    const match = tierNav.find((n: TierNavItem) => {
      if (item.key === 'cases') return n.href.includes('cases') || n.label.includes('Vaka');
      if (item.key === 'fields') return n.href === '/farms';
      if (item.key === 'reports') return n.href.includes('report') || n.href === '/analytics';
      return false;
    });
    return match ? isNavItemLocked(match, tier) : item.plusOnly && tier !== 'plus';
  };

  const handleAction = (action?: string) => {
    if (action === 'new') onNewChat();
    if (action === 'history') onOpenHistory();
    if (action === 'cases') onOpenCases();
  };

  return (
    <aside
      className={cn(
        'flex w-[17rem] shrink-0 flex-col border-r border-border/60 bg-card/50',
        className
      )}
      aria-label={shellCopy.history}
    >
      <div className="border-b border-border/50 px-4 py-5">
        <Link href="/doctor" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            N
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Nertura</p>
            <p className="text-xs text-muted-foreground">AI Tarım Doktoru</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {SIDEBAR_NAV.map((item) => (
          <SidebarNavButton
            key={item.key}
            item={item}
            locked={isLocked(item)}
            onClick={() => handleAction(item.action)}
            onLockedClick={() => openUpgrade()}
          />
        ))}
      </nav>

      {usage && (
        <div className="mx-3 mb-3 rounded-xl border border-border/60 bg-background p-3 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Ücretsiz analiz hakkınız</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
            {usage.used} / {usage.limit}
          </p>
          <button
            type="button"
            onClick={() => openUpgrade()}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            Planları incele
          </button>
        </div>
      )}

      <footer className="border-t border-border/50 px-4 py-3 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link href="https://nertura.com/privacy" className="hover:text-foreground">
            Gizlilik
          </Link>
          <Link href="https://nertura.com/terms" className="hover:text-foreground">
            Koşullar
          </Link>
          <Link href="https://nertura.com/ai-disclaimer" className="hover:text-foreground">
            AI uyarısı
          </Link>
        </div>
      </footer>
    </aside>
  );
}
