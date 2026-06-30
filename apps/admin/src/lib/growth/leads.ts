import { createAdminClient } from '@/lib/supabase/admin';
import type { Lead, LeadStatus } from '@/lib/outreach/db';

export interface ExtendedLead extends Lead {
  country: string | null;
  language: string | null;
  category: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  linkedin: string | null;
  followers: number | null;
  ai_score: number | null;
  trust_score: number | null;
  need_score: number | null;
  risk_score: number | null;
  last_contact_at: string | null;
  tags: string[];
  gdpr_consent: boolean;
  opt_in: boolean;
  metadata: Record<string, unknown>;
}

const EXTENDED_COLUMNS =
  'id, name, company, sector, email, source, status, do_not_contact, unsubscribe_token, created_at, country, language, category, website, instagram, facebook, youtube, linkedin, followers, ai_score, trust_score, need_score, risk_score, last_contact_at, tags, gdpr_consent, opt_in, metadata';

export async function listLeads(options?: {
  status?: LeadStatus;
  category?: string;
  country?: string;
  limit?: number;
}): Promise<ExtendedLead[]> {
  const admin = createAdminClient();
  let query = admin.from('leads').select(EXTENDED_COLUMNS).order('created_at', { ascending: false });

  if (options?.status) query = query.eq('status', options.status);
  if (options?.category) query = query.eq('category', options.category);
  if (options?.country) query = query.eq('country', options.country);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ExtendedLead[];
}

export async function getLeadById(id: string): Promise<ExtendedLead | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from('leads').select(EXTENDED_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as ExtendedLead | null) ?? null;
}

export async function updateLead(
  id: string,
  patch: Partial<Omit<ExtendedLead, 'id' | 'created_at' | 'unsubscribe_token'>>
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('leads').update(patch).eq('id', id);
  if (error) throw error;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  body: string;
  created_at: string;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  interaction_type: string;
  title: string;
  body: string | null;
  created_at: string;
}

export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('growth_lead_notes')
    .select('id, lead_id, body, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getLeadInteractions(leadId: string): Promise<LeadInteraction[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('growth_lead_interactions')
    .select('id, lead_id, interaction_type, title, body, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addLeadNote(leadId: string, body: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('growth_lead_notes').insert({ lead_id: leadId, body });
  if (error) throw error;
  await admin.from('growth_lead_interactions').insert({
    lead_id: leadId,
    interaction_type: 'note',
    title: 'Note added',
    body,
  });
}

export async function getLeadEmailHistory(leadId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('email_log')
    .select('id, subject, body, status, sent_at, opened, replied, clicked, bounced, spam_score, language, delivery_status, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function computeRelationshipScore(lead: ExtendedLead, emailCount: number, noteCount: number): number {
  let score = 50;
  if (lead.status === 'cevaplandi') score += 30;
  if (lead.status === 'iletisim_kuruldu') score += 15;
  if (lead.opt_in) score += 10;
  if (lead.do_not_contact) score = 0;
  score += Math.min(emailCount * 5, 20);
  score += Math.min(noteCount * 3, 15);
  if (lead.ai_score != null) score = Math.round((score + lead.ai_score) / 2);
  return Math.min(100, Math.max(0, score));
}
