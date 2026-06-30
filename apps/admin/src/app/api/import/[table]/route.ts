import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeKnowledgeItemRows } from '@/lib/import/knowledge-items';
import { normalizeKnowledgeRows, parseCSV, parseJSON } from '@/lib/import/parse';
import { KNOWLEDGE_IMPORT_TABLES, type KnowledgeImportTable } from '@/lib/import/types';

function isImportTable(value: string): value is KnowledgeImportTable {
  return (KNOWLEDGE_IMPORT_TABLES as readonly string[]).includes(value);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await context.params;

    if (!isImportTable(table)) {
      return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });
    }

    const body = (await request.json()) as {
      format?: string;
      content?: string;
      preview?: boolean;
    };
    const format = body.format === 'json' ? 'json' : 'csv';
    const content = body.content?.trim();
    const preview = body.preview === true;

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const rawRows = format === 'json' ? parseJSON(content) : parseCSV(content);
    if (!rawRows.length) {
      return NextResponse.json({ error: 'No rows found in import data' }, { status: 400 });
    }

    const admin = createAdminClient();

    if (table === 'knowledge_items') {
      const { records, errors } = normalizeKnowledgeItemRows(rawRows);

      if (preview) {
        return NextResponse.json({
          preview: true,
          total_rows: rawRows.length,
          valid_rows: records.length,
          failed_rows: errors.length,
          errors,
          sample: records.slice(0, 5),
        });
      }

      if (!records.length) {
        return NextResponse.json({ error: 'No valid rows', errors }, { status: 400 });
      }

      const { data, error } = await admin
        .from('knowledge_items')
        .upsert(records, { onConflict: 'slug' })
        .select('slug');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const batch = await admin
        .from('knowledge_import_batches')
        .insert({
          table_target: 'knowledge_items',
          format,
          total_rows: rawRows.length,
          success_rows: data?.length ?? 0,
          failed_rows: errors.length,
          errors,
        })
        .select('id')
        .single();

      return NextResponse.json({
        table,
        batchId: batch.data?.id,
        imported: data?.length ?? 0,
        failed: errors.length,
        slugs: data?.map((row) => row.slug) ?? [],
        errors,
      });
    }

    const records = normalizeKnowledgeRows(rawRows);

    if (preview) {
      return NextResponse.json({
        preview: true,
        total_rows: rawRows.length,
        valid_rows: records.length,
        sample: records.slice(0, 5),
      });
    }

    const { data, error } = await admin
      .from(table)
      .upsert(records, { onConflict: 'slug' })
      .select('slug');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      table,
      imported: data?.length ?? 0,
      slugs: data?.map((row) => row.slug) ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
