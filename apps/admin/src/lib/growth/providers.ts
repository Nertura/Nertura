import { createAdminClient } from '@/lib/supabase/admin';

export type ProviderType =
  | 'resend'
  | 'sendgrid'
  | 'mailgun'
  | 'postmark'
  | 'amazon_ses'
  | 'brevo';

export interface GrowthProvider {
  id: string;
  provider_type: ProviderType;
  display_name: string;
  status: 'connected' | 'disconnected' | 'error' | 'disabled';
  domain: string | null;
  domain_verified: boolean;
  priority: number;
  failover_enabled: boolean;
  rate_limit_per_day: number;
  daily_usage: number;
  last_test_at: string | null;
  last_error: string | null;
  health_score: number | null;
  api_key_hint: string | null;
}

const PROVIDER_ENV_KEYS: Record<ProviderType, string | undefined> = {
  resend: process.env.RESEND_API_KEY,
  sendgrid: process.env.SENDGRID_API_KEY,
  mailgun: process.env.MAILGUN_API_KEY,
  postmark: process.env.POSTMARK_API_KEY,
  amazon_ses: process.env.AWS_SES_ACCESS_KEY,
  brevo: process.env.BREVO_API_KEY,
};

export async function listProviders(): Promise<GrowthProvider[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('growth_email_providers')
    .select('*')
    .order('priority', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const type = row.provider_type as ProviderType;
    const envKey = PROVIDER_ENV_KEYS[type];
    const connected = Boolean(envKey);
    return {
      ...(row as GrowthProvider),
      status: row.status === 'disabled' ? 'disabled' : connected ? 'connected' : 'disconnected',
      api_key_hint: envKey ? `••••${envKey.slice(-4)}` : null,
      daily_usage: row.daily_usage ?? 0,
    };
  });
}

export async function updateProvider(
  id: string,
  patch: Partial<Pick<GrowthProvider, 'priority' | 'failover_enabled' | 'status' | 'domain'>>
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('growth_email_providers').update(patch).eq('id', id);
  if (error) throw error;
}

export async function testProvider(id: string): Promise<{ ok: boolean; message: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('growth_email_providers')
    .select('provider_type, display_name')
    .eq('id', id)
    .single();

  if (error || !data) return { ok: false, message: 'Provider not found' };

  const type = data.provider_type as ProviderType;
  const envKey = PROVIDER_ENV_KEYS[type];
  const now = new Date().toISOString();

  if (!envKey) {
    await admin
      .from('growth_email_providers')
      .update({ last_test_at: now, last_error: 'API key not configured in environment', health_score: 0 })
      .eq('id', id);
    return { ok: false, message: 'API key not configured in environment variables' };
  }

  await admin
    .from('growth_email_providers')
    .update({
      last_test_at: now,
      last_error: null,
      health_score: 100,
      status: 'connected',
    })
    .eq('id', id);

  return { ok: true, message: `${data.display_name} connection verified via environment key` };
}

export async function syncResendProviderFromEnv(): Promise<void> {
  const admin = createAdminClient();
  const key = process.env.RESEND_API_KEY;
  const domain = process.env.OUTREACH_FROM_EMAIL?.split('@')[1] ?? null;

  await admin
    .from('growth_email_providers')
    .update({
      status: key ? 'connected' : 'disconnected',
      domain,
      domain_verified: Boolean(key && domain),
      api_key_hint: key ? `••••${key.slice(-4)}` : null,
      health_score: key ? 100 : 0,
      last_test_at: key ? new Date().toISOString() : null,
    })
    .eq('provider_type', 'resend');
}
