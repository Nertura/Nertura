import Link from 'next/link';

import { notFound } from 'next/navigation';



import { Button, Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';



import { InvalidFarmIdHint } from '@/components/farm/invalid-farm-id';

import { PageHeader, StatusBadge } from '@/components/dashboard/page-header';

import { formatFarmArea } from '@/lib/farm/area-units';

import { formatFarmLocation } from '@/lib/farm/location';

import { isUuid } from '@/lib/farm/uuid';

import { getDashboardContext } from '@/lib/auth/context';

import { FIELD_COPY } from '@/lib/i18n/field-copy';

import { createClient } from '@/lib/supabase/server';

import type { Farm } from '@nertura/types';



const F = FIELD_COPY.farm;



export default async function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;



  if (!isUuid(id)) {

    return (

      <div>

        <PageHeader title={F.detailsTitle} />

        <InvalidFarmIdHint id={id} />

      </div>

    );

  }



  const ctx = await getDashboardContext();

  const supabase = await createClient();



  const { data: farm } = await supabase

    .from('farms')

    .select('*')

    .eq('id', id)

    .eq('organization_id', ctx.organizationId)

    .is('deleted_at', null)

    .maybeSingle();



  if (!farm) notFound();



  const { count: fieldCount } = await supabase

    .from('fields')

    .select('*', { count: 'exact', head: true })

    .eq('farm_id', id)

    .is('deleted_at', null);



  const f = farm as Farm;



  return (

    <div>

      <PageHeader

        title={f.name}

        description={f.description ?? F.detailsDescription}

        action={

          ctx.canWrite ? (

            <Link href={`/farms/${id}/edit`}>

              <Button variant="outline">Düzenle</Button>

            </Link>

          ) : undefined

        }

      />

      <div className="grid gap-6 lg:grid-cols-2">

        <Card>

          <CardHeader>

            <CardTitle>Detaylar</CardTitle>

          </CardHeader>

          <CardContent className="space-y-2 text-sm">

            <p>

              <span className="text-muted-foreground">Durum:</span>{' '}

              <StatusBadge status={f.status} />

            </p>

            <p>

              <span className="text-muted-foreground">Alan:</span>{' '}

              {formatFarmArea(f.total_area, f.area_unit, f.metadata) ?? '—'}

            </p>

            {formatFarmLocation(f) && (

              <p>

                <span className="text-muted-foreground">Konum:</span> {formatFarmLocation(f)}

              </p>

            )}

            <p>

              <span className="text-muted-foreground">Koordinatlar:</span> {f.latitude ?? '—'},{' '}

              {f.longitude ?? '—'}

            </p>

            <p>

              <span className="text-muted-foreground">Tarlalar:</span> {fieldCount ?? 0}

            </p>

          </CardContent>

        </Card>

        <Card>

          <CardHeader>

            <CardTitle>Hızlı bağlantılar</CardTitle>

          </CardHeader>

          <CardContent className="flex flex-col gap-2">

            <Link href={`/farms/${id}/map`} className="text-sm font-medium text-primary hover:underline">

              Çiftlik haritasını aç

            </Link>

            <Link href={`/fields?farm=${id}`} className="text-sm text-primary hover:underline">

              Tarlaları görüntüle

            </Link>

            <Link href={`/weather?farm=${id}`} className="text-sm text-primary hover:underline">

              Bu çiftlik için hava durumu

            </Link>

          </CardContent>

        </Card>

      </div>

    </div>

  );

}

