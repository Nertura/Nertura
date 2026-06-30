#!/usr/bin/env npx tsx
/**
 * Approval workflow + send safety verification (no external email sends)
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const { createAdminClient } = await import('../../src/lib/supabase/admin');
  const { updateEmailDraft, getEmailDraftById } = await import('../../src/lib/outreach/db');
  const { OutreachSendError, sendApprovedDrafts } = await import('../../src/lib/outreach/send-approved');

  const admin = createAdminClient();

  const { data: lead } = await admin
    .from('leads')
    .select('id')
    .eq('email', 'test@example.com')
    .single();

  if (!lead) throw new Error('Test lead missing');

  const { data: draftA, error: aErr } = await admin
    .from('email_log')
    .insert({
      lead_id: lead.id,
      subject: 'Test approve subject',
      body: 'Test approve body',
      status: 'taslak',
    })
    .select('id')
    .single();

  const { data: draftB, error: bErr } = await admin
    .from('email_log')
    .insert({
      lead_id: lead.id,
      subject: 'Test reject subject',
      body: 'Test reject body',
      status: 'taslak',
    })
    .select('id')
    .single();

  if (aErr || bErr || !draftA || !draftB) {
    throw new Error('Failed to create test drafts');
  }

  await updateEmailDraft(draftA.id, { subject: 'Edited subject', body: 'Edited body' }, { requireStatus: 'taslak' });
  await updateEmailDraft(draftA.id, { status: 'onaylandi' }, { requireStatus: 'taslak' });
  await updateEmailDraft(draftB.id, { status: 'reddedildi' }, { requireStatus: 'taslak' });

  const approved = await getEmailDraftById(draftA.id);
  const rejected = await getEmailDraftById(draftB.id);

  let sendBlocked = false;
  try {
    await sendApprovedDrafts();
  } catch (err) {
    sendBlocked = err instanceof OutreachSendError && err.code === 'NOT_CONFIGURED';
  }

  let doubleApproveBlocked = false;
  try {
    await updateEmailDraft(draftA.id, { status: 'onaylandi' }, { requireStatus: 'taslak' });
  } catch (err) {
    doubleApproveBlocked = err instanceof Error && err.message.includes('Only taslak');
  }

  console.log(
    JSON.stringify(
      {
        editOk: approved?.subject === 'Edited subject' && approved?.body === 'Edited body',
        approveStatus: approved?.status,
        rejectStatus: rejected?.status,
        sendBlockedWithoutResend: sendBlocked,
        doubleApproveBlocked,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
