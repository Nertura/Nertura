import Link from 'next/link';

import { Button } from '@nertura/ui';

import { FarmMapClient } from '@/components/farm/farm-map-client';
import { InvalidFarmIdHint } from '@/components/farm/invalid-farm-id';
import { PageHeader } from '@/components/dashboard/page-header';
import { formatFarmLocation } from '@/lib/farm/location';
import { isUuid } from '@/lib/farm/uuid';
import { getDashboardContext } from '@/lib/auth/context';
import { fieldRowToMapData } from '@/lib/geo/field-geo';
import { isMapboxTokenConfigured } from '@/lib/geo/map-config';
import { createClient } from '@/lib/supabase/server';
import type { Farm, Field } from '@nertura/types';
import { notFound } from 'next/navigation';

export default async function FarmMapPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    draw?: string;
    intake?: string;
    location?: string;
    crop?: string;
    statedArea?: string;
    areaUnit?: string;
    symptom?: string;
    field?: string;
  }>;
}) {
  const { id } = await params;
  const { draw, intake, location, crop, statedArea, areaUnit, symptom, field: fieldId } =
    await searchParams;

  if (!isUuid(id)) {
    return (
      <div>
        <PageHeader title="Çiftlik haritası" description="Tarla sınırları" />
        <InvalidFarmIdHint id={id} />
      </div>
    );
  }

  const ctx = await getDashboardContext();
  const supabase = await createClient();

  const { data: userRow } = await supabase
    .from('users')
    .select('language')
    .eq('id', ctx.userId)
    .maybeSingle();

  const locale = userRow?.language === 'en' ? 'en' : 'tr';

  const { data: farm } = await supabase
    .from('farms')
    .select('*')
    .eq('id', id)
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!farm) notFound();

  const { data: fieldsRaw } = await supabase
    .from('fields')
    .select('id, name, area, area_m2, soil_type, metadata, crops(crop_name)')
    .eq('farm_id', id)
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .order('name');

  const f = farm as Farm;
  const fields = ((fieldsRaw ?? []) as (Field & {
    crops?: { crop_name: string } | { crop_name: string }[] | null;
  })[]).map((field) => fieldRowToMapData(field));

  const farmCenter =
    f.latitude != null && f.longitude != null
      ? { lat: Number(f.latitude), lng: Number(f.longitude) }
      : fields[0]?.coordinates[0] ?? null;

  const locationLabel = formatFarmLocation(f);
  const mapTokenConfigured = isMapboxTokenConfigured();
  const isIntakeFlow = intake === '1';

  return (
    <div>
      <PageHeader
        title={f.name}
        description={
          isIntakeFlow
            ? 'Tarlanı haritada bul, sınırı çiz ve AI Doktor ile devam et.'
            : locationLabel
              ? `${locationLabel}${mapTokenConfigured ? '' : ' · Uydu haritası için Mapbox token ekleyin'}`
              : mapTokenConfigured
                ? 'Tarla sınırlarını çiz ve yönet'
                : 'Tarla çizimi — uydu için NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ekleyin'
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/farms/${id}`}>
              <Button variant="outline">Çiftlik detayı</Button>
            </Link>
            <Link href={`/fields?farm=${id}`}>
              <Button variant="outline">Tüm tarlalar</Button>
            </Link>
          </div>
        }
      />
      <FarmMapClient
        farmId={id}
        farmName={f.name}
        farmLocation={locationLabel}
        initialFields={fields}
        canWrite={ctx.canWrite}
        farmCenter={farmCenter}
        locale={locale}
        initialFieldId={fieldId && isUuid(fieldId) ? fieldId : null}
        autoStartDraw={draw === '1' || intake === '1'}
        intakePrefill={
          intake === '1'
            ? {
                location: location ?? null,
                crop: crop ?? null,
                statedArea: statedArea ? Number(statedArea) : null,
                areaUnit: areaUnit ?? 'donum',
                symptom: symptom ?? null,
              }
            : undefined
        }
      />
    </div>
  );
}
