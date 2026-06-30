import { getApprovedDrafts, markEmailSent } from './db';
import { isResendConfigured, sendOutreachEmail } from './resend';

export class OutreachSendError extends Error {
  constructor(
    message: string,
    readonly code: 'NOT_CONFIGURED' | 'SEND_FAILED' = 'SEND_FAILED'
  ) {
    super(message);
    this.name = 'OutreachSendError';
  }
}

export async function sendApprovedDrafts(): Promise<{
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}> {
  if (!isResendConfigured()) {
    throw new OutreachSendError(
      'RESEND_API_KEY and OUTREACH_FROM_EMAIL must be configured before sending',
      'NOT_CONFIGURED'
    );
  }

  const drafts = await getApprovedDrafts();
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const draft of drafts) {
    if (draft.status !== 'onaylandi') {
      skipped++;
      continue;
    }

    const lead = draft.leads;
    if (!lead?.email) {
      failed++;
      errors.push(`Draft ${draft.id}: missing lead email`);
      continue;
    }

    if (lead.do_not_contact) {
      skipped++;
      errors.push(`Draft ${draft.id}: lead opted out (do_not_contact)`);
      continue;
    }

    try {
      const result = await sendOutreachEmail({
        to: lead.email,
        subject: draft.subject,
        body: draft.body,
      });
      await markEmailSent(draft.id, result.id);
      sent++;
    } catch (err) {
      failed++;
      errors.push(
        `Draft ${draft.id}: ${err instanceof Error ? err.message : 'send failed'}`
      );
    }
  }

  return { sent, failed, skipped, errors };
}
