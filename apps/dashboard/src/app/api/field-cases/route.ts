import { NextResponse } from 'next/server';

import type { FarmIntakeParseResult } from '@nertura/ai';

import { getDashboardContext } from '@/lib/auth/context';
import { createFieldCase, listFieldCases } from '@/lib/intake/field-case-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const ctx = await getDashboardContext();
    const { searchParams } = new URL(request.url);
    const fieldId = searchParams.get('fieldId');
    const status = searchParams.get('status') as 'open' | 'monitoring' | 'resolved' | null;

    const supabase = await createClient();
    const cases = await listFieldCases(supabase, {
      organizationId: ctx.organizationId,
      fieldId: fieldId ?? undefined,
      status: status ?? undefined,
    });

    return NextResponse.json({ cases });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to list field cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getDashboardContext();
    const body = (await request.json()) as {
      intake?: FarmIntakeParseResult;
      farmId?: string;
      fieldId?: string;
      conversationId?: string;
    };

    if (!body.intake?.rawText) {
      return NextResponse.json({ error: 'intake is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const fieldCase = await createFieldCase(supabase, {
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      farmId: body.farmId,
      fieldId: body.fieldId,
      conversationId: body.conversationId,
      intake: body.intake,
    });

    return NextResponse.json({ fieldCase });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create field case' },
      { status: 500 }
    );
  }
}
