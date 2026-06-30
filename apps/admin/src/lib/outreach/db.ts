import { createAdminClient } from '@/lib/supabase/admin';

export type LeadStatus = 'yeni' | 'taslak_uretildi' | 'iletisim_kuruldu' | 'cevaplandi' | 'disqualified';
export type EmailLogStatus = 'taslak' | 'onaylandi' | 'reddedildi' | 'sent';

export interface Lead {
  id: string;
  name: string | null;
  company: string;
  sector: string;
  email: string;
  source: string;
  status: LeadStatus;
  do_not_contact: boolean;
  unsubscribe_token: string;
  created_at: string;
}

const LEAD_COLUMNS =
  'id, name, company, sector, email, source, status, do_not_contact, unsubscribe_token, created_at';

export interface EmailLogRow {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  status: EmailLogStatus;
  sent_at: string | null;
  opened: boolean;
  replied: boolean;
  created_at: string;
  leads?: Lead | null;
}

export interface DraftWithLead extends EmailLogRow {
  leads: Lead;
}

function normalizeLeadJoin(leads: Lead | Lead[] | null | undefined): Lead | null {
  if (!leads) return null;
  if (Array.isArray(leads)) return leads[0] ?? null;
  return leads;
}

export async function listDraftEmails(): Promise<DraftWithLead[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('email_log')
    .select(
      `
      id, lead_id, subject, body, status, sent_at, opened, replied, created_at,
      leads ( ${LEAD_COLUMNS} )
    `
    )
    .eq('status', 'taslak')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const lead = normalizeLeadJoin(row.leads as Lead | Lead[] | null);
      if (!lead) return null;
      const { leads: _drop, ...rest } = row;
      return { ...rest, leads: lead } as DraftWithLead;
    })
    .filter((r): r is DraftWithLead => r !== null);
}

export async function countNewLeads(): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'yeni');

  if (error) throw error;
  return count ?? 0;
}

export async function insertLead(params: {
  name?: string | null;
  company: string;
  sector: string;
  email: string;
  source?: string;
}): Promise<{ inserted: boolean; id?: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leads')
    .insert({
      name: params.name ?? null,
      company: params.company,
      sector: params.sector,
      email: params.email.toLowerCase().trim(),
      source: params.source ?? 'web_search',
      status: 'yeni',
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { inserted: false };
    throw error;
  }

  return { inserted: true, id: data.id as string };
}

export async function getEmailDraftById(id: string): Promise<EmailLogRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('email_log')
    .select('id, lead_id, subject, body, status, sent_at, opened, replied, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as EmailLogRow | null) ?? null;
}

export async function updateEmailDraft(
  id: string,
  patch: { subject?: string; body?: string; status?: EmailLogStatus },
  options?: { requireStatus?: EmailLogStatus }
): Promise<void> {
  const admin = createAdminClient();

  if (options?.requireStatus) {
    const existing = await getEmailDraftById(id);
    if (!existing) throw new Error('Draft not found');
    if (existing.status !== options.requireStatus) {
      throw new Error(`Only ${options.requireStatus} drafts can be modified`);
    }
  }

  const { error } = await admin.from('email_log').update(patch).eq('id', id);
  if (error) throw error;
}

export async function insertEmailDraft(params: {
  leadId: string;
  subject: string;
  body: string;
}): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('email_log')
    .insert({
      lead_id: params.leadId,
      subject: params.subject,
      body: params.body,
      status: 'taslak',
    })
    .select('id')
    .single();

  if (error) throw error;

  await admin.from('leads').update({ status: 'taslak_uretildi' }).eq('id', params.leadId);

  return data.id as string;
}

export async function markLeadContacted(leadId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from('leads').update({ status: 'iletisim_kuruldu' }).eq('id', leadId);
}

export async function getApprovedDrafts(): Promise<DraftWithLead[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('email_log')
    .select(
      `
      id, lead_id, subject, body, status, sent_at, opened, replied, created_at,
      leads ( ${LEAD_COLUMNS} )
    `
    )
    .eq('status', 'onaylandi');

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const lead = normalizeLeadJoin(row.leads as Lead | Lead[] | null);
      if (!lead) return null;
      const { leads: _drop, ...rest } = row;
      return { ...rest, leads: lead } as DraftWithLead;
    })
    .filter((r): r is DraftWithLead => r !== null);
}

export async function markEmailSent(
  emailLogId: string,
  providerMessageId?: string
): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: row } = await admin
    .from('email_log')
    .select('lead_id')
    .eq('id', emailLogId)
    .single();

  await admin
    .from('email_log')
    .update({
      status: 'sent',
      sent_at: now,
      delivery_status: 'delivered',
      provider_message_id: providerMessageId ?? null,
    })
    .eq('id', emailLogId);

  if (row?.lead_id) {
    await admin.from('leads').update({ status: 'iletisim_kuruldu' }).eq('id', row.lead_id);
  }
}

export async function listNewLeads(limit = 50): Promise<Lead[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leads')
    .select(LEAD_COLUMNS)
    .eq('status', 'yeni')
    .eq('do_not_contact', false)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function leadHasDraft(leadId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { count } = await admin
    .from('email_log')
    .select('id', { count: 'exact', head: true })
    .eq('lead_id', leadId)
    .in('status', ['taslak', 'onaylandi', 'sent']);

  return (count ?? 0) > 0;
}
