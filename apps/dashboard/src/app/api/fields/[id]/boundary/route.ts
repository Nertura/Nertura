import { NextResponse } from 'next/server';

import { getDashboardContext } from '@/lib/auth/context';
import {
  mapBoundaryRpcError,
  parseBoundaryFromRequest,
} from '@/lib/geo/boundary-validation';
import { fieldMetadataToCoordinates } from '@/lib/geo/field-geo';
import { createClient } from '@/lib/supabase/server';
import type { Field } from '@nertura/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getDashboardContext();
    if (!ctx.canWrite) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const parsed = parseBoundaryFromRequest(await request.json());
    if (!parsed.ok) {
      console.error('[field boundary]', id, parsed.technicalReason);
      return NextResponse.json({ error: parsed.userMessage }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('fields')
      .select('id')
      .eq('id', id)
      .eq('organization_id', ctx.organizationId)
      .is('deleted_at', null)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const { data: updated, error } = await supabase.rpc('update_field_boundary', {
      p_field_id: id,
      p_boundary_geojson: parsed.boundary,
    });

    if (error) {
      console.error('[field boundary rpc]', id, error.message);
      return NextResponse.json({ error: mapBoundaryRpcError(error.message) }, { status: 400 });
    }

    const field = updated as Field;
    return NextResponse.json({
      field: {
        ...field,
        coordinates: fieldMetadataToCoordinates(field.metadata ?? {}),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    console.error('[field boundary]', message);
    return NextResponse.json({ error: mapBoundaryRpcError(message) }, { status: 400 });
  }
}
