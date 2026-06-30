import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@nertura/ui';

import { PageHeader } from '@/components/dashboard/page-header';
import { softDeleteFarm, updateFarm } from '@/lib/actions/operations';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';
import type { Farm } from '@nertura/types';

export default async function EditFarmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getDashboardContext();
  if (!ctx.canWrite) redirect(`/farms/${id}`);

  const supabase = await createClient();
  const { data: farm } = await supabase
    .from('farms')
    .select('*')
    .eq('id', id)
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!farm) notFound();
  const f = farm as Farm;

  const boundUpdate = updateFarm.bind(null, id);
  const boundDelete = softDeleteFarm.bind(null, id);

  return (
    <div>
      <PageHeader title={`Edit ${f.name}`} description="Update farm information." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Farm details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={boundUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={f.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={f.description ?? ''} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" name="latitude" type="number" step="any" defaultValue={f.latitude ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" name="longitude" type="number" step="any" defaultValue={f.longitude ?? ''} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_area">Total area</Label>
                <Input id="total_area" name="total_area" type="number" step="any" defaultValue={f.total_area ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue={f.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Save changes</Button>
              <Link href={`/farms/${id}`}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
          {ctx.canAdmin && (
            <form action={boundDelete} className="mt-8 border-t pt-6">
              <Button type="submit" variant="outline" className="text-destructive">
                Archive farm
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
