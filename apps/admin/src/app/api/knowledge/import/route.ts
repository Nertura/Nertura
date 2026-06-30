import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { slugifyTitle, toDbRow } from '@/lib/knowledge-bank';
import { parseCSV, parseJSON } from '@/lib/import/parse';

const bodySchema = z.object({
  format: z.enum(['csv', 'json']),
  content: z.string().min(1),
  preview: z.boolean().optional(),
});

function normalizeImportRow(row: Record<string, unknown>, index: number) {
  const title = String(row.title ?? row.name_en ?? '').trim();
  if (!title) throw new Error(`Row ${index + 1}: title is required`);

  const slug = String(row.slug ?? slugifyTitle(title)).trim();

  return toDbRow(
    {
      title,
      category: String(row.category ?? row.type ?? 'article'),
      crop: row.crop ? String(row.crop) : undefined,
      disease: row.disease ? String(row.disease) : undefined,
      symptoms: String(row.symptoms ?? row.symptoms_text ?? ''),
      treatment: String(row.treatment ?? ''),
      prevention: String(row.prevention ?? row.prevention_text ?? ''),
      source: String(row.source ?? 'import'),
      language: String(row.language ?? 'en'),
      content: String(row.content ?? row.summary_en ?? ''),
    },
    slug
  );
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const rawRows = body.format === 'json' ? parseJSON(body.content) : parseCSV(body.content);

    if (!rawRows.length) {
      return NextResponse.json({ error: 'No rows found' }, { status: 400 });
    }

    const records: ReturnType<typeof toDbRow>[] = [];
    const errors: string[] = [];

    rawRows.forEach((row, i) => {
      try {
        records.push(normalizeImportRow(row, i));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : `Row ${i + 1} invalid`);
      }
    });

    if (body.preview) {
      return NextResponse.json({
        preview: true,
        total_rows: rawRows.length,
        valid_rows: records.length,
        failed_rows: errors.length,
        errors,
        sample: records.slice(0, 3),
      });
    }

    if (!records.length) {
      return NextResponse.json({ error: 'No valid rows', errors }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('knowledge_items')
      .upsert(records, { onConflict: 'slug' })
      .select('id, slug');

    if (error) throw error;

    await admin.from('knowledge_import_batches').insert({
      table_target: 'knowledge_items',
      format: body.format,
      total_rows: rawRows.length,
      success_rows: data?.length ?? 0,
      failed_rows: errors.length,
      errors,
      metadata: { source: 'knowledge_bank_import' },
    });

    return NextResponse.json({
      imported: data?.length ?? 0,
      failed: errors.length,
      errors,
      slugs: (data ?? []).map((r) => r.slug),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
