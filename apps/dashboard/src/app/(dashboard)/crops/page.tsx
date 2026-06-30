import Link from 'next/link';

import { Button, Card, CardContent } from '@nertura/ui';

import { DataTable, PageHeader, StatusBadge } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';
import { FIELD_COPY } from '@/lib/i18n/field-copy';
import { createClient } from '@/lib/supabase/server';
import type { Crop } from '@nertura/types';

const C = FIELD_COPY.crops;

export default async function CropsPage() {
  const ctx = await getDashboardContext();
  const supabase = await createClient();

  const { data: crops } = await supabase
    .from('crops')
    .select('*, fields(name)')
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title={C.title}
        description={C.description}
        action={
          ctx.canWrite ? (
            <Link href="/crops/new"><Button>{C.add}</Button></Link>
          ) : undefined
        }
      />

      {!crops?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {C.empty}{' '}
            {ctx.canWrite && <Link href="/crops/new" className="text-primary underline">{C.createOne}</Link>}
          </CardContent>
        </Card>
      ) : (
        <DataTable headers={[C.headers.crop, C.headers.field, C.headers.season, C.headers.stage, C.headers.status, C.headers.actions]}>
          {(crops as Crop[]).map((crop) => {
            const fieldName = Array.isArray(crop.fields) ? crop.fields[0]?.name : crop.fields?.name;
            return (
              <tr key={crop.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{crop.crop_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{fieldName ?? '—'}</td>
                <td className="px-4 py-3">{crop.season}</td>
                <td className="px-4 py-3">{crop.current_stage ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={crop.status} /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/crops/${crop.id}`} className="text-sm text-primary hover:underline">{C.view}</Link>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}
