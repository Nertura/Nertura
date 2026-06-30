import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button, Card, CardContent, Input, Label } from '@nertura/ui';

import { PageHeader } from '@/components/dashboard/page-header';
import { softDeleteCrop, updateCrop } from '@/lib/actions/operations';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';
import type { Crop } from '@nertura/types';

export default async function EditCropPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getDashboardContext();
  if (!ctx.canWrite) redirect(`/crops/${id}`);

  const supabase = await createClient();
  const { data: crop } = await supabase
    .from('crops')
    .select('*')
    .eq('id', id)
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!crop) notFound();
  const c = crop as Crop;

  return (
    <div>
      <PageHeader title={`Edit ${c.crop_name}`} />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form action={updateCrop.bind(null, id)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crop_name">Crop</Label>
              <Input id="crop_name" name="crop_name" defaultValue={c.crop_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Input id="season" name="season" defaultValue={c.season} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planting_date">Planting</Label>
                <Input id="planting_date" name="planting_date" type="date" defaultValue={c.planting_date ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_harvest_date">Harvest</Label>
                <Input id="expected_harvest_date" name="expected_harvest_date" type="date" defaultValue={c.expected_harvest_date ?? ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue={c.status}>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="harvested">Harvested</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <Link href={`/crops/${id}`}><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
          <form action={softDeleteCrop.bind(null, id)} className="mt-8 border-t pt-6">
            <Button type="submit" variant="outline" className="text-destructive">Remove crop plan</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
