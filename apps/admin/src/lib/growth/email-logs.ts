import { createAdminClient } from '@/lib/supabase/admin';

export interface EmailLogEntry {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  status: string;
  delivery_status: string | null;
  sent_at: string | null;
  opened: boolean;
  clicked: boolean;
  bounced: boolean;
  replied: boolean;
  spam_score: number | null;
  language: string | null;
  provider_message_id: string | null;
  scheduled_at: string | null;
  created_at: string;
  leads?: {
    id: string;
    name: string | null;
    company: string;
    email: string;
    country: string | null;
  } | null;
}

export async function listEmailLogs(options?: {
  status?: string;
  deliveryStatus?: string;
  search?: string;
  limit?: number;
}): Promise<EmailLogEntry[]> {
  const admin = createAdminClient();
  let query = admin
    .from('email_log')
    .select(
      `
      id, lead_id, subject, body, status, delivery_status, sent_at,
      opened, clicked, bounced, replied, spam_score, language,
      provider_message_id, scheduled_at, created_at,
      leads ( id, name, company, email, country )
    `
    )
    .order('created_at', { ascending: false });

  if (options?.status) query = query.eq('status', options.status);
  if (options?.deliveryStatus) query = query.eq('delivery_status', options.deliveryStatus);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []).map((row) => {
    const rawLeads = row.leads as
      | { id: string; name: string | null; company: string; email: string; country: string | null }
      | { id: string; name: string | null; company: string; email: string; country: string | null }[]
      | null;
    const lead = Array.isArray(rawLeads) ? rawLeads[0] ?? null : rawLeads;
    const { leads: _drop, ...rest } = row;
    return { ...rest, leads: lead } as EmailLogEntry;
  });
  if (options?.search) {
    const q = options.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.subject.toLowerCase().includes(q) ||
        r.leads?.email.toLowerCase().includes(q) ||
        r.leads?.company.toLowerCase().includes(q)
    );
  }
  return rows;
}

export async function getAnalyticsSummary() {
  const admin = createAdminClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [sent, opened, clicked, leads, users, campaigns, content] = await Promise.all([
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('opened', true),
    admin.from('email_log').select('id', { count: 'exact', head: true }).eq('clicked', true),
    admin.from('leads').select('country, language, category'),
    admin.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    admin.from('growth_campaigns').select('id, status, expected_open_rate, expected_ctr'),
    admin.from('media_content_queue').select('platform, status'),
  ]);

  const sentCount = sent.count ?? 0;
  const openedCount = opened.count ?? 0;
  const clickedCount = clicked.count ?? 0;

  const countryMap = new Map<string, number>();
  const languageMap = new Map<string, number>();
  for (const lead of leads.data ?? []) {
    if (lead.country) countryMap.set(lead.country, (countryMap.get(lead.country) ?? 0) + 1);
    if (lead.language) languageMap.set(lead.language, (languageMap.get(lead.language) ?? 0) + 1);
  }

  const topCountries = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  const topLanguages = [...languageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([language, count]) => ({ language, count }));

  const platformMap = new Map<string, number>();
  for (const item of content.data ?? []) {
    platformMap.set(item.platform, (platformMap.get(item.platform) ?? 0) + 1);
  }

  return {
    openRate: sentCount > 0 ? Math.round((openedCount / sentCount) * 1000) / 10 : 0,
    ctr: sentCount > 0 ? Math.round((clickedCount / sentCount) * 1000) / 10 : 0,
    sentTotal: sentCount,
    newUsersWeek: users.count ?? 0,
    campaignCount: campaigns.data?.length ?? 0,
    topCountries,
    topLanguages,
    topContent: [...platformMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([platform, count]) => ({ platform, count })),
  };
}

export function emailLogsToCsv(logs: EmailLogEntry[]): string {
  const header = 'id,email,company,subject,status,delivery_status,sent_at,opened,clicked,bounced';
  const rows = logs.map((l) =>
    [
      l.id,
      l.leads?.email ?? '',
      l.leads?.company ?? '',
      `"${l.subject.replace(/"/g, '""')}"`,
      l.status,
      l.delivery_status ?? '',
      l.sent_at ?? '',
      l.opened,
      l.clicked,
      l.bounced,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}
