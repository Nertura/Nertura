'use client';

import Link from 'next/link';
import {
  Globe,
  Mail,
  MousePointerClick,
  Send,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';

import { buttonVariants } from '@nertura/ui';

import { GrowthMetricCard, GrowthSection } from '@/components/growth/growth-ui';
import type { GrowthDashboardStats } from '@/lib/growth/stats';

export function GrowthDashboardClient({ stats }: { stats: GrowthDashboardStats }) {
  return (
    <div className="space-y-10">
      <GrowthSection
        title="Today at a glance"
        description="Live metrics from leads, email logs, users, and scheduled items."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <GrowthMetricCard label="New Leads Today" value={stats.newLeadsToday} icon={<Users className="h-4 w-4" />} />
          <GrowthMetricCard label="Emails Generated" value={stats.emailsGenerated} icon={<Mail className="h-4 w-4" />} />
          <GrowthMetricCard label="Pending Approvals" value={stats.pendingApprovals} hint="Draft + approved queue" />
          <GrowthMetricCard label="Scheduled" value={stats.scheduled} />
          <GrowthMetricCard label="Sent Today" value={stats.sentToday} icon={<Send className="h-4 w-4" />} />
          <GrowthMetricCard label="Delivered" value={stats.delivered} trend="up" />
          <GrowthMetricCard label="Opened" value={stats.opened} />
          <GrowthMetricCard label="Clicked" value={stats.clicked} icon={<MousePointerClick className="h-4 w-4" />} />
          <GrowthMetricCard label="Bounce Rate" value={`${stats.bounceRate}%`} trend={stats.bounceRate > 5 ? 'down' : 'neutral'} />
          <GrowthMetricCard label="Spam Score" value={stats.spamScore.toFixed(1)} hint="Lower is better" />
          <GrowthMetricCard label="New Users" value={stats.newUsers} icon={<UserPlus className="h-4 w-4" />} />
          <GrowthMetricCard label="App Installs" value={stats.appInstalls} hint="Registered today" />
          <GrowthMetricCard label="Premium Conversions" value={stats.premiumConversions} icon={<TrendingUp className="h-4 w-4" />} />
          <GrowthMetricCard label="Estimated Reach" value={stats.estimatedReach.toLocaleString()} />
          <GrowthMetricCard label="Global Countries Active" value={stats.globalCountriesActive} icon={<Globe className="h-4 w-4" />} />
        </div>
      </GrowthSection>

      <GrowthSection
        title="Quick actions"
        description="AI automation creates drafts only — founder approval required before any send."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: '/growth-ai/lead-discovery', label: 'Discover leads', desc: 'AI web search by sector' },
            { href: '/growth-ai/outreach', label: 'Review outreach', desc: 'Approve email drafts' },
            { href: '/growth-ai/campaigns', label: 'Build campaign', desc: 'Target audience + AI estimates' },
            { href: '/growth-ai/content-studio', label: 'Content Studio', desc: 'Multi-channel drafts' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-signal/40 hover:shadow-md"
            >
              <Sparkles className="h-4 w-4 text-signal" />
              <p className="mt-3 font-medium text-void group-hover:text-signal">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </Link>
          ))}
        </div>
      </GrowthSection>

      <div className="flex flex-wrap gap-3">
        <Link href="/growth-ai/outreach" className={buttonVariants()}>
          Review pending emails
        </Link>
        <Link href="/growth-ai/compliance" className={buttonVariants({ variant: 'outline' })}>
          Compliance center
        </Link>
      </div>
    </div>
  );
}
