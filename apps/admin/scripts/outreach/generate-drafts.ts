#!/usr/bin/env npx tsx
/**
 * Taslak üretici — 'yeni' leadler için Claude ile mail taslağı
 * Usage: pnpm outreach:generate-drafts
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const { isClaudeConfigured } = await import('../../src/lib/outreach/claude');
  const { runGenerateDrafts } = await import('../../src/lib/outreach/pipeline');

  if (!isClaudeConfigured()) {
    console.info('[outreach] ANTHROPIC_API_KEY is not set.');
    console.info('[outreach] Add ANTHROPIC_API_KEY to apps/admin/.env.local to generate drafts.');
    process.exit(0);
  }

  console.info('[outreach] Generating drafts for new leads…');
  const result = await runGenerateDrafts();
  console.info(
    `[outreach] Processed ${result.processed}, created ${result.created}, skipped ${result.skipped}`
  );
}

main().catch((err) => {
  console.error('[outreach] Draft generation failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
