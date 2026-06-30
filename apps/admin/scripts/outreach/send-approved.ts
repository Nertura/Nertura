#!/usr/bin/env npx tsx
/**
 * Onaylanmış taslakları Resend ile gönder
 * Usage: pnpm outreach:send-approved
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const { isResendConfigured } = await import('../../src/lib/outreach/resend');
  const { OutreachSendError, sendApprovedDrafts } = await import('../../src/lib/outreach/send-approved');

  if (!isResendConfigured()) {
    console.info('[outreach] RESEND_API_KEY or OUTREACH_FROM_EMAIL is not set.');
    console.info('[outreach] Configure both in apps/admin/.env.local before sending.');
    process.exit(0);
  }

  console.info('[outreach] Sending approved drafts only…');
  try {
    const result = await sendApprovedDrafts();
    console.info(
      `[outreach] Sent: ${result.sent}, failed: ${result.failed}, skipped: ${result.skipped}`
    );
    if (result.errors.length) console.error(result.errors.join('\n'));
  } catch (err) {
    if (err instanceof OutreachSendError && err.code === 'NOT_CONFIGURED') {
      console.info(`[outreach] ${err.message}`);
      process.exit(0);
    }
    throw err;
  }
}

main().catch((err) => {
  console.error('[outreach] Send failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
