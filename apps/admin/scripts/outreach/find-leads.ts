#!/usr/bin/env npx tsx
/**
 * Lead bulma scripti
 * Usage: pnpm outreach:find-leads [sektor]
 * Example: pnpm outreach:find-leads sera
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const sector = process.argv[2] ?? process.env.OUTREACH_DEFAULT_SECTOR ?? 'sera';

  const { runFindLeads } = await import('../../src/lib/outreach/pipeline');

  console.info(`[outreach] Searching leads for sector: ${sector}`);
  const result = await runFindLeads(sector);
  console.info(`[outreach] Found ${result.found}, inserted ${result.inserted} new leads`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
