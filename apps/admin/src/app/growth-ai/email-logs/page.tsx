import { EmailLogsClient } from '@/components/growth/email-logs-client';
import { listEmailLogs } from '@/lib/growth/email-logs';

export default async function EmailLogsPage() {
  let logs: Awaited<ReturnType<typeof listEmailLogs>> = [];
  try {
    logs = await listEmailLogs({ limit: 500 });
  } catch {
    logs = [];
  }
  return <EmailLogsClient logs={logs} />;
}
