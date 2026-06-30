import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { fromDbRow, toDbRow } from '@/lib/knowledge-bank';

const createSchema = z.object({
  title: z.string().min(1).max(500),
  category: z.string().optional(),
  crop: z.string().optional(),
  disease: z.string().optional(),
  symptoms: z.string().optional(),
  treatment: z.string().optional(),
  prevention: z.string().optional(),
  source: z.string().optional(),
  language: z.string().optional(),
  content: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const admin = createAdminClient();

    let query = admin
      .from('knowledge_items')
      .select(
        'id, title, category, crop, disease, symptoms_text, treatment, prevention_text, source, language, content, created_at, slug, type, name_en'
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (q) {
      query = query.or(
        `title.ilike.%${q}%,crop.ilike.%${q}%,disease.ilike.%${q}%,content.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      items: (data ?? []).map((row) => fromDbRow(row as Record<string, unknown>)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list knowledge items';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    const admin = createAdminClient();
    const row = toDbRow(body);

    const { data, error } = await admin.from('knowledge_items').insert(row).select('*').single();
    if (error) throw error;

    return NextResponse.json({ item: fromDbRow(data as Record<string, unknown>) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create knowledge item';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
