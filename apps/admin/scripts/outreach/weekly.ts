#!/usr/bin/env npx tsx
/**
 * Haftalık otomasyon — lead bul, taslak üret, admin'e bildir (outreach mail göndermez)
 * Usage: pnpm outreach:weekly
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const sector = process.argv[2] ?? process.env.OUTREACH_DEFAULT_SECTOR ?? 'sera';

  const { isClaudeConfigured } = await import('../../src/lib/outreach/claude');
  const { runWeeklyOutreach } = await import('../../src/lib/outreach/pipeline');
  const { sendAdminNotification } = await import('../../src/lib/outreach/resend');

  console.info(`[outreach] Weekly run for sector: ${sector}`);
  console.info('[outreach] Note: this does not send outreach emails — approval required at /outreach');

  const result = await runWeeklyOutreach(sector);

  if (!isClaudeConfigured()) {
    console.info('[outreach] ANTHROPIC_API_KEY missing — drafts were not generated.');
  }

  await sendAdminNotification({
    subject: `[Nertura Outreach] Haftalık otomasyon`,
    body: JSON.stringify(result, null, 2),
  });

  console.info('[outreach] Done:', result);
}

main().catch((err) => {
  console.error('[outreach] Weekly run failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
