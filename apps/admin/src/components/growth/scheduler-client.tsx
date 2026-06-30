'use client';

import { AdminDataList } from '@/components/admin-data-list';
import { GrowthMetricCard, GrowthSection, GrowthStatusBadge } from '@/components/growth/growth-ui';
import type { ScheduledItem } from '@/lib/growth/scheduler';

export function SchedulerClient({
  scheduled,
  retryQueue,
}: {
  scheduled: ScheduledItem[];
  retryQueue: ScheduledItem[];
}) {
  const upcoming = scheduled.filter((s) => s.status === 'scheduled' || s.status === 'pending');

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <GrowthMetricCard label="Scheduled items" value={upcoming.length} />
        <GrowthMetricCard label="Retry queue" value={retryQueue.length} />
        <GrowthMetricCard label="Failed (retryable)" value={retryQueue.length} trend={retryQueue.length > 0 ? 'down' : 'neutral'} />
      </div>

      <GrowthSection title="Scheduled emails & posts" description="Weekly calendar view — all items require approval before execution.">
        <AdminDataList
          title=""
          description=""
          rows={scheduled}
          searchKeys={['title']}
          columns={[
            { key: 'title', header: 'Title' },
            {
              key: 'schedule_type',
              header: 'Type',
              render: (r) => r.schedule_type.replace(/_/g, ' '),
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <GrowthStatusBadge status={r.status} />,
            },
            {
              key: 'scheduled_at',
              header: 'Scheduled',
              render: (r) => new Date(r.scheduled_at).toLocaleString(),
            },
          ]}
        />
      </GrowthSection>

      {retryQueue.length > 0 && (
        <GrowthSection title="Retry queue">
          <AdminDataList
            title=""
            description=""
            rows={retryQueue}
            columns={[
              { key: 'title', header: 'Title' },
              { key: 'retry_count', header: 'Retries' },
              {
                key: 'scheduled_at',
                header: 'Next attempt',
                render: (r) => new Date(r.scheduled_at).toLocaleString(),
              },
            ]}
          />
        </GrowthSection>
      )}
    </div>
  );
}
