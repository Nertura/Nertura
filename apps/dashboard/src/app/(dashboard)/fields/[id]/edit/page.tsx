import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button, Card, CardContent, Input, Label } from '@nertura/ui';

import { PageHeader } from '@/components/dashboard/page-header';
import { softDeleteField, updateField } from '@/lib/actions/operations';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';
import type { Field } from '@nertura/types';

export default async function EditFieldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getDashboardContext();
  if (!ctx.canWrite) redirect(`/fields/${id}`);

  const supabase = await createClient();
  const { data: field } = await supabase
    .from('fields')
    .select('*')
    .eq('id', id)
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!field) notFound();
  const f = field as Field;

  return (
    <div>
      <PageHeader title={`Edit ${f.name}`} />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form action={updateField.bind(null, id)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={f.name} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="area">Area (ha)</Label>
                <Input id="area" name="area" type="number" step="any" defaultValue={f.area ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soil_ph">Soil pH</Label>
                <Input id="soil_ph" name="soil_ph" type="number" step="0.1" defaultValue={f.soil_ph ?? ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="soil_type">Soil type</Label>
              <Input id="soil_type" name="soil_type" defaultValue={f.soil_type ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue={f.status}>
                <option value="active">Active</option>
                <option value="fallow">Fallow</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <Link href={`/fields/${id}`}><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
          {ctx.canAdmin && (
            <form action={softDeleteField.bind(null, id)} className="mt-8 border-t pt-6">
              <Button type="submit" variant="outline" className="text-destructive">Archive field</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
