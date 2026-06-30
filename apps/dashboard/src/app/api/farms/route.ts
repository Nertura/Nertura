import { NextResponse } from 'next/server';
import { z } from 'zod';

import { normalizeFarmArea } from '@/lib/farm/area-units';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  name: z.string().min(1).max(255),
  countryCode: z.string().min(2).max(2),
  city: z.string().min(1).max(120),
  district: z.string().min(1).max(120),
  siteType: z.enum(['farm', 'greenhouse', 'orchard', 'cooperative', 'other']),
  totalArea: z.number().positive().optional().nullable(),
  areaUnit: z.enum(['hectare', 'donum', 'acre']).default('hectare'),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const ctx = await getDashboardContext();
    if (!ctx.canWrite) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = bodySchema.parse(await request.json());
    const supabase = await createClient();
    const area = normalizeFarmArea(body.totalArea, body.areaUnit);

    const countryLabel =
      body.countryCode === 'TR'
        ? 'Turkey'
        : body.countryCode === 'US'
          ? 'United States'
          : body.countryCode;

    const { data: farm, error } = await supabase
      .from('farms')
      .insert({
        organization_id: ctx.organizationId,
        name: body.name.trim(),
        address: {
          country_code: body.countryCode,
          country: countryLabel,
          city: body.city.trim(),
          district: body.district.trim(),
        },
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        total_area: area.total_area,
        area_unit: area.area_unit,
        status: 'active',
        metadata: {
          site_type: body.siteType,
          display_area_unit: area.display_unit,
          display_area: area.display_area,
          created_via: 'farm_wizard',
        },
      })
      .select('id, name')
      .single();

    if (error || !farm) {
      return NextResponse.json({ error: error?.message ?? 'Failed to create farm' }, { status: 400 });
    }

    return NextResponse.json({ farm, redirectTo: `/farms/${farm.id}/map` });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
