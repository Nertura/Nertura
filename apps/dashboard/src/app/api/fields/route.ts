import { NextResponse } from 'next/server';

import { z } from 'zod';



import { getDashboardContext } from '@/lib/auth/context';

import {

  mapBoundaryRpcError,

  parseBoundaryFromRequest,

} from '@/lib/geo/boundary-validation';

import { fieldMetadataToCoordinates } from '@/lib/geo/field-geo';

import { createClient } from '@/lib/supabase/server';



const bodySchema = z.object({

  farmId: z.string().uuid(),

  name: z.string().min(1).max(255),

  fieldType: z.enum(['field', 'greenhouse', 'orchard', 'pasture', 'other']).optional(),

  cropName: z.string().max(255).optional(),

  boundaryGeojson: z.unknown(),

});



export async function POST(request: Request) {

  try {

    const ctx = await getDashboardContext();

    if (!ctx.canWrite) {

      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    }



    const json = await request.json();

    const body = bodySchema.parse(json);



    const boundaryParsed = parseBoundaryFromRequest({ boundaryGeojson: body.boundaryGeojson });

    if (!boundaryParsed.ok) {

      console.error('[fields create] boundary validation', boundaryParsed.technicalReason);

      return NextResponse.json({ error: boundaryParsed.userMessage }, { status: 400 });

    }



    const supabase = await createClient();



    const { data: farm } = await supabase

      .from('farms')

      .select('id')

      .eq('id', body.farmId)

      .eq('organization_id', ctx.organizationId)

      .is('deleted_at', null)

      .maybeSingle();



    if (!farm) {

      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });

    }



    const fieldType = body.fieldType ?? 'field';



    const { data: created, error: insertError } = await supabase

      .from('fields')

      .insert({

        organization_id: ctx.organizationId,

        farm_id: body.farmId,

        name: body.name.trim(),

        status: 'active',

        metadata: { field_type: fieldType },

      })

      .select('id, name, area, area_m2, soil_type, metadata')

      .single();



    if (insertError || !created) {

      return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 400 });

    }



    const { data: updated, error: rpcError } = await supabase.rpc('update_field_boundary', {

      p_field_id: created.id,

      p_boundary_geojson: boundaryParsed.boundary,

    });



    if (rpcError) {

      console.error('[fields create] boundary rpc', created.id, rpcError.message);

      await supabase.from('fields').update({ deleted_at: new Date().toISOString() }).eq('id', created.id);

      return NextResponse.json({ error: mapBoundaryRpcError(rpcError.message) }, { status: 400 });

    }



    if (body.cropName?.trim()) {

      const season = new Date().getFullYear().toString();

      await supabase.from('crops').insert({

        organization_id: ctx.organizationId,

        field_id: created.id,

        crop_name: body.cropName.trim(),

        season,

        status: 'active',

        metadata: { source: 'farm_map' },

      });

    }



    const field = updated ?? created;

    return NextResponse.json({

      field: {

        ...field,

        coordinates: fieldMetadataToCoordinates(field.metadata ?? {}),

      },

    });

  } catch (err) {

    const message = err instanceof Error ? err.message : 'Invalid request';

    console.error('[fields create]', message);

    return NextResponse.json({ error: mapBoundaryRpcError(message) }, { status: 400 });

  }

}


