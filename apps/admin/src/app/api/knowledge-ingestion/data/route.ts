import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tab = url.searchParams.get('tab') ?? 'review';
  const admin = createAdminClient();

  const { data: sources } = await admin
    .from('knowledge_sources')
    .select('*')
    .order('name');

  const { data: jobs } = await admin
    .from('knowledge_ingestion_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  let itemsQuery = admin
    .from('knowledge_ingestion_items')
    .select('id, title, status, citation, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (tab === 'approved') itemsQuery = itemsQuery.eq('status', 'approved');
  else if (tab === 'rejected') itemsQuery = itemsQuery.eq('status', 'rejected');
  else if (tab === 'items') itemsQuery = itemsQuery.neq('status', 'rejected');

  const { data: items } = await itemsQuery;

  let reviewsQuery = admin
    .from('knowledge_review_queue')
    .select('*, knowledge_ingestion_items(title, citation, source_url)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (tab === 'review') {
    reviewsQuery = reviewsQuery.in('status', ['pending', 'needs_expert']);
  } else if (tab === 'approved') {
    reviewsQuery = reviewsQuery.eq('status', 'approved');
  } else if (tab === 'rejected') {
    reviewsQuery = reviewsQuery.eq('status', 'rejected');
  }

  let reviews: Record<string, unknown>[] = [];
  if (tab === 'review' || tab === 'approved' || tab === 'rejected') {
    const { data } = await reviewsQuery;
    reviews = (data ?? []) as Record<string, unknown>[];
  }

  return NextResponse.json({
    sources: sources ?? [],
    jobs: jobs ?? [],
    items: items ?? [],
    reviews: reviews ?? [],
  });
}
