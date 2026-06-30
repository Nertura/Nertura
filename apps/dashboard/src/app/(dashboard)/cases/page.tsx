import { Suspense } from 'react';

import { CaseListView } from '@/components/cases/case-list-view';
import { getDashboardContext } from '@/lib/auth/context';
import { loadCaseList, type CaseListFilter } from '@/lib/projects-engine';
import { createClient } from '@/lib/supabase/server';

function parseFilter(value: string | undefined): CaseListFilter {
  if (value === 'open' || value === 'monitoring' || value === 'resolved') return value;
  return 'all';
}

export default async function CasesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const params = await searchParams;
  const ctx = await getDashboardContext();
  const supabase = await createClient();
  const filter = parseFilter(params.filter);
  const search = params.q?.trim() ?? '';

  const cases = await loadCaseList(supabase, {
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    filter,
    search,
  });

  return (
    <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Vakalar yükleniyor…</p>}>
      <CaseListView cases={cases} initialFilter={filter} initialSearch={search} />
    </Suspense>
  );
}
