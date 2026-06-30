import { NextResponse } from 'next/server';

import { getDashboardContext } from '@/lib/auth/context';
import { getFieldCaseById, updateFieldCaseStatus } from '@/lib/intake/field-case-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getDashboardContext();
    const supabase = await createClient();
    const fieldCase = await getFieldCaseById(supabase, ctx.organizationId, id);

    if (!fieldCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json({ case: fieldCase });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load case' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getDashboardContext();

    if (!ctx.canWrite) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = (await request.json()) as {
      status?: 'open' | 'monitoring' | 'resolved';
      archived?: boolean;
    };

    if (!body.status && body.archived === undefined) {
      return NextResponse.json({ error: 'No update provided' }, { status: 400 });
    }

    const supabase = await createClient();
    const fieldCase = await updateFieldCaseStatus(supabase, ctx.organizationId, id, {
      status: body.status,
      archived: body.archived,
    });

    return NextResponse.json({ case: fieldCase });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update case' },
      { status: 500 }
    );
  }
}
