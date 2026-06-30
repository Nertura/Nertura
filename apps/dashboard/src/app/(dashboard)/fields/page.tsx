import Link from 'next/link';

import { Button, Card, CardContent } from '@nertura/ui';
import { relatedName } from '@nertura/utils';

import { DataTable, PageHeader, StatusBadge } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';
import { OPS_COPY } from '@/lib/i18n/ops-copy';
import { createClient } from '@/lib/supabase/server';
import type { Field } from '@nertura/types';

export default async function FieldsPage({
  searchParams,
}: {
  searchParams: Promise<{ farm?: string }>;
}) {
  const copy = OPS_COPY.fields;
  const { farm: farmFilter } = await searchParams;
  const ctx = await getDashboardContext();
  const supabase = await createClient();

  let query = supabase
    .from('fields')
    .select('*, farms(name)')
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .order('name');

  if (farmFilter) query = query.eq('farm_id', farmFilter);

  const { data: fields } = await query;

  return (
    <div>
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          ctx.canWrite ? (
            <Link href="/intake">
              <Button>{copy.addField}</Button>
            </Link>
          ) : undefined
        }
      />

      {!fields?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {copy.empty}{' '}
            {ctx.canWrite && (
              <Link href="/intake" className="text-primary underline">
                {copy.addField}
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <DataTable
          headers={[
            copy.headers.name,
            copy.headers.farm,
            copy.headers.area,
            copy.headers.soil,
            copy.headers.status,
            copy.headers.action,
          ]}
        >
          {(fields as Field[]).map((field) => {
            const farmName = relatedName(field.farms);
            return (
              <tr key={field.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{field.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{farmName ?? '—'}</td>
                <td className="px-4 py-3 tabular-nums">{field.area ?? '—'}</td>
                <td className="px-4 py-3">{field.soil_type ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={field.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/fields/${field.id}`} className="text-sm text-primary hover:underline">
                    {copy.view}
                  </Link>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}
