import { notFound } from 'next/navigation';

import { CaseTrackingView } from '@/components/cases/case-tracking-view';
import { getDashboardContext } from '@/lib/auth/context';
import { signedImageUrl } from '@/lib/ai/conversations';
import {
  buildCaseTimeline,
  loadCaseOverview,
  loadCasePhotos,
  loadCaseTasks,
} from '@/lib/projects-engine';
import { createClient } from '@/lib/supabase/server';

export default async function CaseTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getDashboardContext();
  const supabase = await createClient();

  const overview = await loadCaseOverview(supabase, ctx.organizationId, id);
  if (!overview) notFound();

  const [timeline, tasks, photos] = await Promise.all([
    buildCaseTimeline(supabase, id),
    loadCaseTasks(supabase, id),
    loadCasePhotos(supabase, id, (path) => signedImageUrl(supabase, path)),
  ]);

  return (
    <CaseTrackingView
      overview={overview}
      timeline={timeline}
      photos={photos}
      tasks={tasks}
    />
  );
}
