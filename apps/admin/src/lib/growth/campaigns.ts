import { createAdminClient } from '@/lib/supabase/admin';

export interface GrowthCampaign {
  id: string;
  name: string;
  status: string;
  target_country: string | null;
  target_language: string | null;
  target_industry: string | null;
  target_crop: string | null;
  target_problem: string | null;
  estimated_reach: number | null;
  expected_open_rate: number | null;
  expected_ctr: number | null;
  ai_confidence: number | null;
  subject_template: string | null;
  body_template: string | null;
  created_at: string;
  approved_at: string | null;
}

export async function listCampaigns(): Promise<GrowthCampaign[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('growth_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as GrowthCampaign[];
}

export async function createCampaign(params: {
  name: string;
  target_country?: string;
  target_language?: string;
  target_industry?: string;
  target_crop?: string;
  target_problem?: string;
}): Promise<string> {
  const admin = createAdminClient();

  const { count: leadCount } = await admin.from('leads').select('id', { count: 'exact', head: true });

  const { data, error } = await admin
    .from('growth_campaigns')
    .insert({
      name: params.name,
      target_country: params.target_country ?? null,
      target_language: params.target_language ?? 'tr',
      target_industry: params.target_industry ?? null,
      target_crop: params.target_crop ?? null,
      target_problem: params.target_problem ?? null,
      estimated_reach: leadCount ?? 0,
      expected_open_rate: 28.5,
      expected_ctr: 4.2,
      ai_confidence: 72,
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateCampaignStatus(
  id: string,
  status: GrowthCampaign['status']
): Promise<void> {
  const admin = createAdminClient();
  const patch: Record<string, unknown> = { status };
  if (status === 'approved') patch.approved_at = new Date().toISOString();
  const { error } = await admin.from('growth_campaigns').update(patch).eq('id', id);
  if (error) throw error;
}

export async function duplicateCampaign(id: string): Promise<string> {
  const admin = createAdminClient();
  const { data: source, error: fetchErr } = await admin
    .from('growth_campaigns')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchErr || !source) throw new Error('Campaign not found');

  const { data, error } = await admin
    .from('growth_campaigns')
    .insert({
      name: `${source.name} (copy)`,
      target_country: source.target_country,
      target_language: source.target_language,
      target_industry: source.target_industry,
      target_crop: source.target_crop,
      target_problem: source.target_problem,
      estimated_reach: source.estimated_reach,
      expected_open_rate: source.expected_open_rate,
      expected_ctr: source.expected_ctr,
      ai_confidence: source.ai_confidence,
      subject_template: source.subject_template,
      body_template: source.body_template,
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}
