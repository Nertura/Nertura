import { SchedulerClient } from '@/components/growth/scheduler-client';
import { listRetryQueue, listScheduledItems } from '@/lib/growth/scheduler';

export default async function SchedulerPage() {
  let scheduled: Awaited<ReturnType<typeof listScheduledItems>> = [];
  let retryQueue: Awaited<ReturnType<typeof listRetryQueue>> = [];
  try {
    [scheduled, retryQueue] = await Promise.all([listScheduledItems(), listRetryQueue()]);
  } catch {
    scheduled = [];
    retryQueue = [];
  }
  return <SchedulerClient scheduled={scheduled} retryQueue={retryQueue} />;
}
