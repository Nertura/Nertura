'use client';

import { GrowthMetricCard, GrowthSection } from '@/components/growth/growth-ui';

interface AnalyticsData {
  openRate: number;
  ctr: number;
  sentTotal: number;
  newUsersWeek: number;
  campaignCount: number;
  topCountries: { country: string; count: number }[];
  topLanguages: { language: string; count: number }[];
  topContent: { platform: string; count: number }[];
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GrowthMetricCard label="Open rate" value={`${data.openRate}%`} />
        <GrowthMetricCard label="CTR" value={`${data.ctr}%`} />
        <GrowthMetricCard label="Emails sent" value={data.sentTotal} />
        <GrowthMetricCard label="New users (7d)" value={data.newUsersWeek} />
        <GrowthMetricCard label="Campaigns" value={data.campaignCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GrowthSection title="Top countries">
          <ul className="space-y-2 rounded-2xl border bg-card p-4">
            {data.topCountries.length === 0 ? (
              <li className="text-sm text-muted-foreground">No country data yet</li>
            ) : (
              data.topCountries.map((c) => (
                <li key={c.country} className="flex justify-between text-sm">
                  <span>{c.country}</span>
                  <span className="font-medium tabular-nums">{c.count}</span>
                </li>
              ))
            )}
          </ul>
        </GrowthSection>

        <GrowthSection title="Top languages">
          <ul className="space-y-2 rounded-2xl border bg-card p-4">
            {data.topLanguages.length === 0 ? (
              <li className="text-sm text-muted-foreground">No language data yet</li>
            ) : (
              data.topLanguages.map((l) => (
                <li key={l.language} className="flex justify-between text-sm">
                  <span>{l.language.toUpperCase()}</span>
                  <span className="font-medium tabular-nums">{l.count}</span>
                </li>
              ))
            )}
          </ul>
        </GrowthSection>

        <GrowthSection title="Top content platforms">
          <ul className="space-y-2 rounded-2xl border bg-card p-4">
            {data.topContent.length === 0 ? (
              <li className="text-sm text-muted-foreground">No content drafts yet</li>
            ) : (
              data.topContent.map((c) => (
                <li key={c.platform} className="flex justify-between text-sm">
                  <span className="capitalize">{c.platform.replace(/_/g, ' ')}</span>
                  <span className="font-medium tabular-nums">{c.count}</span>
                </li>
              ))
            )}
          </ul>
        </GrowthSection>
      </div>
    </div>
  );
}
