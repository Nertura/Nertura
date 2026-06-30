import { listDraftEmails } from '@/lib/outreach/db';
import { OutreachApprovalClient } from '@/components/outreach-approval-client';

export default async function GrowthOutreachPage() {
  let drafts: Awaited<ReturnType<typeof listDraftEmails>> = [];
  try {
    drafts = await listDraftEmails();
  } catch {
    drafts = [];
  }
  return <OutreachApprovalClient initialDrafts={drafts} embedded />;
}
