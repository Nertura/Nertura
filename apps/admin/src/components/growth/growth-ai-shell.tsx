'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  BarChart3,
  Calendar,
  FileText,
  LayoutDashboard,
  Mail,
  Megaphone,
  PenLine,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

import { cn } from '@nertura/ui';

const GROWTH_NAV = [
  { href: '/growth-ai', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/growth-ai/lead-discovery', label: 'Lead Discovery', icon: Search },
  { href: '/growth-ai/crm', label: 'CRM', icon: Users },
  { href: '/growth-ai/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/growth-ai/outreach', label: 'Outreach', icon: Send },
  { href: '/growth-ai/content-studio', label: 'Content Studio', icon: PenLine },
  { href: '/growth-ai/scheduler', label: 'Scheduler', icon: Calendar },
  { href: '/growth-ai/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/growth-ai/providers', label: 'Providers', icon: Zap },
  { href: '/growth-ai/email-logs', label: 'Email Logs', icon: Mail },
  { href: '/growth-ai/compliance', label: 'Compliance Center', icon: Shield },
  { href: '/growth-ai/settings', label: 'Settings', icon: Settings },
] as const;

export function GrowthAiShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-signal" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Growth Intelligence
            </p>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-void">Growth AI</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Global growth engine — lead discovery, CRM, campaigns, outreach, content, and compliance.
            Founder approval required for all sends and publishes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <FileText className="h-3.5 w-3.5" />
          Draft-only · No auto-send
        </div>
      </div>

      <nav
        className="-mx-1 flex gap-1 overflow-x-auto pb-1 scrollbar-none"
        aria-label="Growth AI modules"
      >
        {GROWTH_NAV.map((item) => {
          const { href, label, icon: Icon } = item;
          const exact = 'exact' in item && item.exact;
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-void text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
