#!/usr/bin/env npx tsx
/**
 * Outreach CRM hardening verification (read-only + safe test lead)
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

async function tableExists(name: string): Promise<boolean> {
  const { error } = await admin.from(name).select('id', { head: true, count: 'exact' }).limit(1);
  return !error;
}

async function main() {
  const report: Record<string, unknown> = {};

  report.leadsTable = await tableExists('leads');
  report.emailLogTable = await tableExists('email_log');

  const { data: sampleLead, error: leadErr } = await admin
    .from('leads')
    .select('id, company, email, do_not_contact, unsubscribe_token')
    .eq('email', 'test@example.com')
    .maybeSingle();

  if (leadErr) report.leadQueryError = leadErr.message;

  if (!sampleLead) {
    const { data: inserted, error: insErr } = await admin
      .from('leads')
      .insert({
        company: 'Nertura Test Farm',
        sector: 'sera',
        email: 'test@example.com',
        source: 'manual_test',
        status: 'yeni',
      })
      .select('id, company, email, do_not_contact, unsubscribe_token')
      .single();

    report.leadInserted = !insErr;
    report.testLead = inserted ?? insErr?.message;
  } else {
    report.leadInserted = false;
    report.testLead = sampleLead;
  }

  const { count: draftCount } = await admin
    .from('email_log')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'taslak');

  report.draftCount = draftCount ?? 0;

  const env = {
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    OUTREACH_FROM_EMAIL: Boolean(process.env.OUTREACH_FROM_EMAIL),
    OUTREACH_NOTIFY_EMAIL: Boolean(process.env.OUTREACH_NOTIFY_EMAIL),
    CRON_SECRET: Boolean(process.env.CRON_SECRET),
    SERPAPI_KEY: Boolean(process.env.SERPAPI_KEY),
  };
  report.env = env;

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
