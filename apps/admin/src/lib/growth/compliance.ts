import { createAdminClient } from '@/lib/supabase/admin';

export interface ComplianceSettings {
  id: string;
  gdpr_enabled: boolean;
  kvkk_enabled: boolean;
  can_spam_enabled: boolean;
  double_opt_in: boolean;
  unsubscribe_footer_enabled: boolean;
  dmarc_status: string | null;
  spf_status: string | null;
  dkim_status: string | null;
  domain_reputation_score: number | null;
  global_spam_score: number | null;
}

export interface SuppressionEntry {
  id: string;
  email: string;
  reason: string;
  source: string;
  created_at: string;
}

export async function getComplianceSettings(): Promise<ComplianceSettings | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from('growth_compliance_settings').select('*').limit(1).maybeSingle();
  if (error) throw error;
  return data as ComplianceSettings | null;
}

export async function updateComplianceSettings(
  patch: Partial<Omit<ComplianceSettings, 'id'>>
): Promise<void> {
  const admin = createAdminClient();
  const existing = await getComplianceSettings();
  if (!existing) throw new Error('Compliance settings not found');
  const { error } = await admin.from('growth_compliance_settings').update(patch).eq('id', existing.id);
  if (error) throw error;
}

export async function listSuppressionList(): Promise<SuppressionEntry[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('growth_suppression_list')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addToSuppressionList(email: string, reason: string): Promise<void> {
  const admin = createAdminClient();
  const normalized = email.toLowerCase().trim();
  const { error } = await admin.from('growth_suppression_list').insert({
    email: normalized,
    reason,
    source: 'manual',
  });
  if (error && error.code !== '23505') throw error;
  await admin.from('leads').update({ do_not_contact: true }).eq('email', normalized);
}

export async function listAuditLog(limit = 100) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('growth_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function logGrowthAudit(params: {
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from('growth_audit_log').insert({
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id ?? null,
    details: params.details ?? {},
  });
}
