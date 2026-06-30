import { createAdminClient } from '@/lib/supabase/admin';

export interface ScheduledItem {
  id: string;
  schedule_type: string;
  status: string;
  title: string;
  scheduled_at: string;
  completed_at: string | null;
  retry_count: number;
  max_retries: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function listScheduledItems(options?: {
  from?: string;
  to?: string;
  status?: string;
}): Promise<ScheduledItem[]> {
  const admin = createAdminClient();
  let query = admin.from('growth_scheduled_items').select('*').order('scheduled_at', { ascending: true });

  if (options?.from) query = query.gte('scheduled_at', options.from);
  if (options?.to) query = query.lte('scheduled_at', options.to);
  if (options?.status) query = query.eq('status', options.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ScheduledItem[];
}

export async function scheduleEmail(params: {
  emailLogId: string;
  subject: string;
  scheduledAt: string;
}): Promise<string> {
  const admin = createAdminClient();

  await admin
    .from('email_log')
    .update({ scheduled_at: params.scheduledAt, delivery_status: 'queued' })
    .eq('id', params.emailLogId);

  const { data, error } = await admin
    .from('growth_scheduled_items')
    .insert({
      schedule_type: 'email',
      status: 'scheduled',
      title: params.subject,
      scheduled_at: params.scheduledAt,
      reference_id: params.emailLogId,
      reference_table: 'email_log',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function listRetryQueue(): Promise<ScheduledItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('growth_scheduled_items')
    .select('*')
    .eq('status', 'failed')
    .lt('retry_count', 3)
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ScheduledItem[];
}

export interface GrowthSettings {
  id: string;
  org_language: string;
  daily_email_limit: number;
  hourly_email_limit: number;
  per_domain_limit: number;
  per_provider_limit: number;
  automation_enabled: boolean;
  founder_approval_required: boolean;
}

export async function getGrowthSettings(): Promise<GrowthSettings | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from('growth_settings').select('*').limit(1).maybeSingle();
  if (error) throw error;
  return data as GrowthSettings | null;
}

export async function updateGrowthSettings(
  patch: Partial<Omit<GrowthSettings, 'id'>>
): Promise<void> {
  const admin = createAdminClient();
  const existing = await getGrowthSettings();
  if (!existing) throw new Error('Settings not found');
  const { error } = await admin.from('growth_settings').update(patch).eq('id', existing.id);
  if (error) throw error;
}
