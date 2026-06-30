import type { SupabaseClient } from '@supabase/supabase-js';

import { computeDuplicateHash, normalizeIngestionText } from './hash';
import { resolveProvider } from './providers';
import { summarizeIngestionItem } from './summarize';
import type { KnowledgeSourceRow, PipelineRunResult } from './types';

const DEFAULT_MAX_PER_SOURCE = 5;

export async function runKnowledgeIngestionPipeline(
  supabase: SupabaseClient,
  options?: {
    triggerType?: 'cron' | 'manual';
    latitude?: number | null;
    longitude?: number | null;
    maxPerSource?: number;
  }
): Promise<PipelineRunResult> {
  const errors: string[] = [];
  let itemsCollected = 0;
  let itemsDuplicated = 0;
  let itemsQueued = 0;
  let sourcesProcessed = 0;

  const { data: job, error: jobError } = await supabase
    .from('knowledge_ingestion_jobs')
    .insert({
      trigger_type: options?.triggerType ?? 'cron',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (jobError || !job) {
    throw new Error(jobError?.message ?? 'Failed to create ingestion job');
  }

  const jobId = job.id as string;

  try {
    const { data: sources, error: srcError } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('enabled', true);

    if (srcError) throw new Error(srcError.message);

    for (const source of (sources ?? []) as KnowledgeSourceRow[]) {
      const provider = resolveProvider(source);
      if (!provider) {
        errors.push(`No provider for source ${source.name}`);
        continue;
      }
      if (!provider.isConfigured()) {
        await supabase.from('knowledge_source_runs').insert({
          job_id: jobId,
          source_id: source.id,
          status: 'skipped',
          error_message: 'Provider not configured',
          completed_at: new Date().toISOString(),
        });
        continue;
      }

      const maxItems =
        Number(source.config?.max_items_per_run) ||
        options?.maxPerSource ||
        DEFAULT_MAX_PER_SOURCE;

      const { data: run, error: runError } = await supabase
        .from('knowledge_source_runs')
        .insert({
          job_id: jobId,
          source_id: source.id,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (runError || !run) {
        errors.push(`Run failed for ${source.name}: ${runError?.message}`);
        continue;
      }

      const runId = run.id as string;
      let runCollected = 0;
      let runDuplicated = 0;

      try {
        const collected = await provider.collect(source, {
          limit: maxItems,
          latitude: options?.latitude,
          longitude: options?.longitude,
        });

        for (const item of collected) {
          const normalized = normalizeIngestionText(item.rawText);
          const hash = computeDuplicateHash({
            title: item.title,
            sourceUrl: item.sourceUrl,
            normalizedText: normalized,
          });

          const { data: existing } = await supabase
            .from('knowledge_ingestion_items')
            .select('id')
            .eq('duplicate_hash', hash)
            .maybeSingle();

          if (existing) {
            runDuplicated++;
            itemsDuplicated++;
            continue;
          }

          const { data: inserted, error: insError } = await supabase
            .from('knowledge_ingestion_items')
            .insert({
              source_id: source.id,
              run_id: runId,
              title: item.title,
              raw_text: item.rawText,
              normalized_text: normalized,
              language: item.language ?? 'en',
              crop: item.crop,
              disease: item.disease,
              pest: item.pest,
              symptom: item.symptom,
              region: item.region,
              source_url: item.sourceUrl,
              citation: item.citation,
              status: 'normalized',
              duplicate_hash: hash,
              metadata: item.metadata ?? {},
            })
            .select('id, title, normalized_text, citation, source_url, crop, disease')
            .single();

          if (insError || !inserted) {
            errors.push(`Insert failed: ${insError?.message}`);
            continue;
          }

          runCollected++;
          itemsCollected++;

          await supabase.from('knowledge_citations').insert({
            ingestion_item_id: inserted.id,
            citation_text: item.citation,
            source_url: item.sourceUrl,
            license: (item.metadata?.license as string) ?? null,
          });

          const summary = await summarizeIngestionItem({
            title: inserted.title as string,
            normalizedText: inserted.normalized_text as string,
            citation: inserted.citation as string,
            sourceUrl: inserted.source_url as string | null,
            crop: inserted.crop as string | null,
            disease: inserted.disease as string | null,
          });

          if (!summary) {
            await supabase
              .from('knowledge_ingestion_items')
              .update({ status: 'summary_pending' })
              .eq('id', inserted.id);
            continue;
          }

          await supabase
            .from('knowledge_ingestion_items')
            .update({ status: 'summarized' })
            .eq('id', inserted.id);

          const { error: queueError } = await supabase.from('knowledge_review_queue').insert({
            item_id: inserted.id,
            ai_summary: summary.shortSummary,
            proposed_knowledge_item: summary.proposedKnowledgeItem,
            risk_level: summary.riskLevel,
            status: 'pending',
          });

          if (!queueError) {
            await supabase
              .from('knowledge_ingestion_items')
              .update({ status: 'review_pending' })
              .eq('id', inserted.id);
            itemsQueued++;
          }
        }

        await supabase
          .from('knowledge_source_runs')
          .update({
            status: 'completed',
            items_collected: runCollected,
            items_duplicated: runDuplicated,
            completed_at: new Date().toISOString(),
          })
          .eq('id', runId);
        sourcesProcessed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Provider error';
        errors.push(`${source.name}: ${msg}`);
        await supabase
          .from('knowledge_source_runs')
          .update({
            status: 'failed',
            error_message: msg,
            completed_at: new Date().toISOString(),
          })
          .eq('id', runId);
      }
    }

    await supabase
      .from('knowledge_ingestion_jobs')
      .update({
        status: 'completed',
        items_collected: itemsCollected,
        items_duplicated: itemsDuplicated,
        items_queued: itemsQueued,
        completed_at: new Date().toISOString(),
        metadata: { errors },
      })
      .eq('id', jobId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Pipeline failed';
    await supabase
      .from('knowledge_ingestion_jobs')
      .update({
        status: 'failed',
        error_message: msg,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    throw err;
  }

  return {
    jobId,
    sourcesProcessed,
    itemsCollected,
    itemsDuplicated,
    itemsQueued,
    errors,
  };
}

export async function approveReviewItem(
  supabase: SupabaseClient,
  reviewId: string,
  reviewerId?: string | null
): Promise<{ knowledgeItemId: string }> {
  const { data: review, error } = await supabase
    .from('knowledge_review_queue')
    .select('*, knowledge_ingestion_items(*)')
    .eq('id', reviewId)
    .maybeSingle();

  if (error || !review) throw new Error('Review item not found');
  if (review.status !== 'pending' && review.status !== 'needs_expert') {
    throw new Error('Review item is not pending');
  }

  const proposed = (review.proposed_knowledge_item ?? {}) as Record<string, unknown>;
  const ingestionItem = review.knowledge_ingestion_items as Record<string, unknown> | null;

  const title = String(proposed.title ?? ingestionItem?.title ?? 'Untitled');
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const { data: kbItem, error: kbError } = await supabase
    .from('knowledge_items')
    .insert({
      type: 'article',
      name_en: title,
      name_tr: title,
      slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
      title,
      category: String(proposed.category ?? 'reference'),
      crop: proposed.crop ?? ingestionItem?.crop ?? null,
      disease: proposed.disease ?? ingestionItem?.disease ?? null,
      content: String(proposed.content ?? ingestionItem?.normalized_text ?? ''),
      source: String(proposed.source ?? ingestionItem?.citation ?? 'ingestion_review'),
      language: String(proposed.language ?? 'en'),
      summary_en: review.ai_summary,
      metadata: {
        ingestion_item_id: review.item_id,
        approved_via: 'knowledge_review_queue',
        requires_expert: false,
      },
    })
    .select('id')
    .single();

  if (kbError || !kbItem) throw new Error(kbError?.message ?? 'KB insert failed');

  await supabase
    .from('knowledge_review_queue')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId ?? null,
      knowledge_item_id: kbItem.id,
    })
    .eq('id', reviewId);

  await supabase
    .from('knowledge_ingestion_items')
    .update({ status: 'approved' })
    .eq('id', review.item_id);

  await supabase
    .from('knowledge_citations')
    .update({ knowledge_item_id: kbItem.id })
    .eq('ingestion_item_id', review.item_id);

  return { knowledgeItemId: kbItem.id as string };
}

export async function rejectReviewItem(
  supabase: SupabaseClient,
  reviewId: string,
  notes?: string,
  reviewerId?: string | null
): Promise<void> {
  const { data: review } = await supabase
    .from('knowledge_review_queue')
    .select('item_id')
    .eq('id', reviewId)
    .maybeSingle();

  if (!review) throw new Error('Review item not found');

  await supabase
    .from('knowledge_review_queue')
    .update({
      status: 'rejected',
      reviewer_notes: notes ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId ?? null,
    })
    .eq('id', reviewId);

  await supabase
    .from('knowledge_ingestion_items')
    .update({ status: 'rejected' })
    .eq('id', review.item_id);
}

export async function markReviewNeedsExpert(
  supabase: SupabaseClient,
  reviewId: string,
  notes?: string
): Promise<void> {
  await supabase
    .from('knowledge_review_queue')
    .update({
      status: 'needs_expert',
      reviewer_notes: notes ?? null,
    })
    .eq('id', reviewId);
}
