import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@nertura/ui';

import { relatedName } from '@nertura/utils';

import { PageHeader } from '@/components/dashboard/page-header';
import { createCrop } from '@/lib/actions/operations';
import { getDashboardContext } from '@/lib/auth/context';
import { FIELD_COPY } from '@/lib/i18n/field-copy';
import { createClient } from '@/lib/supabase/server';

const C = FIELD_COPY.crops;

export default async function NewCropPage() {
  const ctx = await getDashboardContext();
  if (!ctx.canWrite) redirect('/crops');

  const supabase = await createClient();
  const { data: fields } = await supabase
    .from('fields')
    .select('id, name, farms(name)')
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .order('name');

  const currentYear = new Date().getFullYear();

  return (
    <div>
      <PageHeader title={C.newTitle} description={C.newDescription} />
      <Card className="max-w-xl">
        <CardHeader><CardTitle>{C.formTitle}</CardTitle></CardHeader>
        <CardContent>
          <form action={createCrop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field_id">{C.fieldLabel}</Label>
              <select id="field_id" name="field_id" required defaultValue="" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="" disabled>{C.selectField}</option>
                {fields?.map((field) => {
                  const farm = relatedName(field.farms);
                  return (
                    <option key={field.id} value={field.id}>
                      {field.name}{farm ? ` (${farm})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crop_name">{C.cropLabel}</Label>
                <Input id="crop_name" name="crop_name" placeholder={C.cropPlaceholder} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variety_name">{C.varietyLabel}</Label>
                <Input id="variety_name" name="variety_name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="season">{C.seasonLabel}</Label>
              <Input id="season" name="season" defaultValue={`${currentYear}-İlkbahar`} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planting_date">{C.plantingLabel}</Label>
                <Input id="planting_date" name="planting_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_harvest_date">{C.harvestLabel}</Label>
                <Input id="expected_harvest_date" name="expected_harvest_date" type="date" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target_yield">{C.yieldLabel}</Label>
                <Input id="target_yield" name="target_yield" type="number" step="any" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_stage">{C.stageLabel}</Label>
                <Input id="current_stage" name="current_stage" placeholder={C.stagePlaceholder} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{C.statusLabel}</Label>
              <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="planned">
                <option value="planned">{C.statusPlanned}</option>
                <option value="active">{C.statusActive}</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{C.create}</Button>
              <Link href="/crops"><Button type="button" variant="outline">{C.cancel}</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
