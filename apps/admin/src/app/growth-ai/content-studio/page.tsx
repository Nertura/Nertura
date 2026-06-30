import { createAdminClient } from '@/lib/supabase/admin';
import { ContentEngineAdminClient } from '@/components/content-engine-admin-client';

export default async function ContentStudioPage() {
  let rows: { id: string; platform: string; title: string; status: string; script?: string | null }[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('media_content_queue')
      .select('id, platform, title, status, script')
      .order('created_at', { ascending: false })
      .limit(200);
    rows = data ?? [];
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-void">Content Studio</h2>
        <p className="text-sm text-muted-foreground">
          AI generates multi-channel drafts — YouTube, TikTok, Instagram, LinkedIn, blog, newsletter,
          and more. Draft-only, never auto-publish.
        </p>
      </div>
      <ContentEngineAdminClient rows={rows} />
    </div>
  );
}
