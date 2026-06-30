import { NextResponse } from 'next/server';

import type { OrganizationType } from '@nertura/types';

import { requireOnboardingPending } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import type { OnboardingCompletePayload } from '@/lib/onboarding/types';
import { COUNTRY_OPTIONS } from '@/lib/onboarding/types';

function countryMeta(code: string) {
  return COUNTRY_OPTIONS.find((c) => c.code === code) ?? COUNTRY_OPTIONS[0];
}

export async function POST(request: Request) {
  try {
    await requireOnboardingPending();
    const body = (await request.json()) as OnboardingCompletePayload;

    const {
      name,
      slug,
      type,
      countryCode,
      city,
      district,
      latitude,
      longitude,
      farmSize,
      areaUnit,
      siteType,
      crops,
      boundaryGeoJson,
    } = body;

    if (!name?.trim() || !slug?.trim() || !crops?.length || farmSize == null || farmSize <= 0) {
      return NextResponse.json({ error: 'Missing required onboarding fields' }, { status: 400 });
    }

    const meta = countryMeta(countryCode);
    const supabase = await createClient();

    const { data: orgId, error } = await supabase.rpc('complete_onboarding_setup', {
      p_name: name.trim(),
      p_slug: slug.trim(),
      p_type: type as OrganizationType,
      p_country_code: countryCode,
      p_city: city?.trim() ?? '',
      p_district: district?.trim() ?? '',
      p_latitude: latitude,
      p_longitude: longitude,
      p_farm_size: farmSize,
      p_area_unit: areaUnit,
      p_site_type: siteType,
      p_crops: crops,
      p_boundary_geojson: boundaryGeoJson ?? null,
      p_timezone: meta.timezone,
      p_default_currency: meta.currency,
      p_default_language: meta.language,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ organizationId: orgId, redirect: '/doctor' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onboarding failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
