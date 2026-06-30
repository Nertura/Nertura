import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';

import { PageHeader, StatusBadge } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';
import type { Crop } from '@nertura/types';

export default async function CropDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getDashboardContext();
  const supabase = await createClient();

  const { data: crop } = await supabase
    .from('crops')
    .select('*, fields(name, farm_id)')
    .eq('id', id)
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!crop) notFound();
  const c = crop as Crop;
  const fieldName = Array.isArray(c.fields) ? c.fields[0]?.name : c.fields?.name;

  return (
    <div>
      <PageHeader
        title={c.crop_name}
        description={[c.variety_name, fieldName].filter(Boolean).join(' · ') || undefined}
        action={
          ctx.canWrite ? (
            <Link href={`/crops/${id}/edit`}><Button variant="outline">Edit</Button></Link>
          ) : undefined
        }
      />
      <Card>
        <CardHeader><CardTitle>Season plan</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-muted-foreground">Season:</span> {c.season}</p>
          <p><span className="text-muted-foreground">Status:</span> <StatusBadge status={c.status} /></p>
          <p><span className="text-muted-foreground">Planted:</span> {c.planting_date ?? '—'}</p>
          <p><span className="text-muted-foreground">Expected harvest:</span> {c.expected_harvest_date ?? '—'}</p>
          <p><span className="text-muted-foreground">Target yield:</span> {c.target_yield ?? '—'} {c.yield_unit ?? ''}</p>
          <p><span className="text-muted-foreground">Stage:</span> {c.current_stage ?? '—'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
