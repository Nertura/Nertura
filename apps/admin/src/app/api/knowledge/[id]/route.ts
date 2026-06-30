import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { fromDbRow, toDbRow } from '@/lib/knowledge-bank';

const updateSchema = z.object({
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const admin = createAdminClient();
    const { data, error } = await admin.from('knowledge_items').select('*').eq('id', id).single();
    if (error) throw error;
    return NextResponse.json({ item: fromDbRow(data as Record<string, unknown>) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Not found';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = updateSchema.parse(await request.json());
    const admin = createAdminClient();

    const { data: existing, error: fetchErr } = await admin
      .from('knowledge_items')
      .select('slug')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;

    const row = toDbRow(body, existing.slug as string);
    const { data, error } = await admin
      .from('knowledge_items')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ item: fromDbRow(data as Record<string, unknown>) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const admin = createAdminClient();
    const { error } = await admin.from('knowledge_items').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
