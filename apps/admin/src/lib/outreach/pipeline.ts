import { generateOutreachDraft, isClaudeConfigured } from './claude';
import {
  countNewLeads,
  insertEmailDraft,
  insertLead,
  leadHasDraft,
  listNewLeads,
} from './db';
import { findLeadsFromWebSearch } from './find-leads';

export async function runFindLeads(sector: string): Promise<{ found: number; inserted: number }> {
  const candidates = await findLeadsFromWebSearch(sector);
  let inserted = 0;

  for (const c of candidates) {
    const result = await insertLead({
      name: c.name,
      company: c.company,
      sector: c.sector,
      email: c.email,
      source: c.source,
    });
    if (result.inserted) inserted++;
  }

  return { found: candidates.length, inserted };
}

export async function runGenerateDrafts(): Promise<{
  processed: number;
  created: number;
  skipped: number;
  configured: boolean;
}> {
  if (!isClaudeConfigured()) {
    return { processed: 0, created: 0, skipped: 0, configured: false };
  }

  const leads = await listNewLeads(50);
  let created = 0;
  let skipped = 0;

  for (const lead of leads) {
    if (await leadHasDraft(lead.id)) {
      skipped++;
      continue;
    }

    const draft = await generateOutreachDraft(lead);
    await insertEmailDraft({
      leadId: lead.id,
      subject: draft.subject,
      body: draft.body,
    });
    created++;
  }

  return { processed: leads.length, created, skipped, configured: true };
}

export async function runWeeklyOutreach(sector: string): Promise<{
  leadsFound: number;
  leadsInserted: number;
  draftsCreated: number;
  draftsConfigured: boolean;
  newLeadCount: number;
}> {
  let leadsFound = 0;
  let leadsInserted = 0;

  const newCount = await countNewLeads();
  if (newCount === 0) {
    const findResult = await runFindLeads(sector);
    leadsFound = findResult.found;
    leadsInserted = findResult.inserted;
  }

  const draftResult = await runGenerateDrafts();

  return {
    leadsFound,
    leadsInserted,
    draftsCreated: draftResult.created,
    draftsConfigured: draftResult.configured,
    newLeadCount: await countNewLeads(),
  };
}

export type { Lead } from './db';
