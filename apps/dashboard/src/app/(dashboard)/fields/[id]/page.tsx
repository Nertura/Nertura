import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { FieldWorkspace } from '@/components/field/field-workspace';
import { getDashboardContext } from '@/lib/auth/context';
import { loadFieldWorkspaceData } from '@/lib/field-intelligence/field-workspace-loader';
import { createClient } from '@/lib/supabase/server';

export default async function FieldDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getDashboardContext();
  const supabase = await createClient();

  const data = await loadFieldWorkspaceData(supabase, ctx.organizationId, id, ctx.canWrite);
  if (!data) notFound();

  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading field workspace…</p>}>
      <FieldWorkspace data={data} />
    </Suspense>
  );
}
