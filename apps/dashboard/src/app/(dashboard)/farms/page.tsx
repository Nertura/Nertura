import Link from 'next/link';

import { Suspense } from 'react';

import { Map, Tractor } from 'lucide-react';



import { Button, Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';

import { FarmHubCard, type FarmCardData } from '@/components/farm/farm-hub-card';

import { FarmsEmptyState } from '@/components/farm/farms-empty-state';

import { FarmsIntakeGate } from '@/components/intake/farms-intake-gate';

import { PageHeader } from '@/components/dashboard/page-header';

import { formatFarmArea } from '@/lib/farm/area-units';

import { formatFarmLocation } from '@/lib/farm/location';

import { getDashboardContext } from '@/lib/auth/context';
import { getUserLocale } from '@/lib/i18n/user-locale';
import { createClient } from '@/lib/supabase/server';

import type { Farm } from '@nertura/types';



export default async function FarmsPage({

  searchParams,

}: {

  searchParams: Promise<{ intake?: string }>;

}) {

  const { intake } = await searchParams;

  const isIntakeHandoff = intake === '1';



  const ctx = await getDashboardContext();

  const supabase = await createClient();
  const locale = await getUserLocale(supabase, ctx.userId);



  const { data: farmsRaw } = await supabase

    .from('farms')

    .select('*')

    .eq('organization_id', ctx.organizationId)

    .is('deleted_at', null)

    .order('name');



  const farms = (farmsRaw ?? []) as Farm[];

  const farmIds = farms.map((f) => f.id);



  let fieldCountByFarm: Record<string, number> = {};

  if (farmIds.length) {

    const { data: fieldRows } = await supabase

      .from('fields')

      .select('farm_id')

      .eq('organization_id', ctx.organizationId)

      .is('deleted_at', null)

      .in('farm_id', farmIds);



    fieldCountByFarm = (fieldRows ?? []).reduce<Record<string, number>>((acc, row) => {

      const fid = row.farm_id as string;

      acc[fid] = (acc[fid] ?? 0) + 1;

      return acc;

    }, {});

  }



  const farmCards: FarmCardData[] = farms.map((farm) => ({

    ...farm,

    fieldCount: fieldCountByFarm[farm.id] ?? 0,

  }));



  if (isIntakeHandoff) {

    return (

      <div>

        <PageHeader

          title="Çiftliğini seç"

          description="Tarla haritasına geçmeden önce doğru çiftliği seç."

        />

        <Suspense

          fallback={

            <p className="text-sm text-muted-foreground">Yükleniyor…</p>

          }

        >

          <FarmsIntakeGate

            farms={farmCards.map((f) => ({

              id: f.id,

              name: f.name,

              fieldCount: f.fieldCount,

            }))}

          />

        </Suspense>

      </div>

    );

  }



  const primaryFarm = farmCards[0];



  return (

    <div>

      <PageHeader

        title="Çiftliğim"

        description="Çiftlik konumları, tarla haritaları ve alan bilgileri."

        action={

          ctx.canWrite ? (

            <Link href="/farms/new">

              <Button>Çiftlik ekle</Button>

            </Link>

          ) : undefined

        }

      />



      {!farmCards.length ? (

        <FarmsEmptyState canWrite={ctx.canWrite} locale={locale} />

      ) : (

        <>

          {primaryFarm && (

            <Card className="mb-6 border-signal/20 bg-gradient-to-br from-signal/5 to-transparent">

              <CardHeader className="pb-2">

                <CardTitle className="flex items-center gap-2 text-lg">

                  <Tractor className="h-5 w-5 text-signal" aria-hidden />

                  {primaryFarm.name}

                </CardTitle>

              </CardHeader>

              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="space-y-1 text-sm text-muted-foreground">

                  {formatFarmLocation(primaryFarm) && <p>{formatFarmLocation(primaryFarm)}</p>}

                  <div className="flex flex-wrap gap-x-4">

                    {formatFarmArea(

                      primaryFarm.total_area,

                      primaryFarm.area_unit,

                      primaryFarm.metadata

                    ) && (

                      <span>

                        {formatFarmArea(

                          primaryFarm.total_area,

                          primaryFarm.area_unit,

                          primaryFarm.metadata

                        )}

                      </span>

                    )}

                    <span>

                      {primaryFarm.fieldCount} tarla

                    </span>

                  </div>

                </div>

                <Link href={`/farms/${primaryFarm.id}/map`}>

                  <Button>

                    <Map className="mr-2 h-4 w-4" aria-hidden />

                    Haritayı aç

                  </Button>

                </Link>

              </CardContent>

            </Card>

          )}



          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {farmCards.map((farm) => (

              <FarmHubCard key={farm.id} farm={farm} />

            ))}

          </div>

        </>

      )}

    </div>

  );

}


