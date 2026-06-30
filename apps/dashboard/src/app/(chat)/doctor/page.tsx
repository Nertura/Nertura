import { Suspense } from 'react';

import { DoctorChatApp } from '@/components/doctor/chat-app';
import type { FieldOption } from '@/components/doctor/field-context-selector';
import { getDashboardContext } from '@/lib/auth/context';
import { getDashboardCopy } from '@/lib/i18n/dashboard-copy';
import { getUserLocale } from '@/lib/i18n/user-locale';
import { loadFieldIntelligenceContext } from '@/lib/onboarding/farm-profile-loader';
import { createClient } from '@/lib/supabase/server';

export interface DoctorFieldGreeting {
  fieldId: string;
  fieldName: string;
  locationLabel: string | null;
  crop: string | null;
}

export default async function DoctorPage({
  searchParams,
}: {
  searchParams: Promise<{ fieldId?: string; conversation?: string }>;
}) {
  const { fieldId } = await searchParams;
  const ctx = await getDashboardContext();
  const supabase = await createClient();
  const locale = await getUserLocale(supabase, ctx.userId);
  const common = getDashboardCopy(locale).common;

  const { data: fieldsRaw } = await supabase
    .from('fields')
    .select('id, name, area, farms(name), crops(crop_name)')
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .order('name');

  const fields: FieldOption[] = (fieldsRaw ?? []).map((row) => {
    const farms = row.farms as { name: string } | { name: string }[] | null;
    const farmName = Array.isArray(farms) ? farms[0]?.name : farms?.name;
    const cropsRaw = row.crops as { crop_name: string } | { crop_name: string }[] | null;
    const cropList = Array.isArray(cropsRaw)
      ? cropsRaw.map((c) => c.crop_name)
      : cropsRaw?.crop_name
        ? [cropsRaw.crop_name]
        : [];
    return {
      id: row.id as string,
      name: row.name as string,
      farmName,
      areaHectares: row.area != null ? Number(row.area) : null,
      crops: cropList.filter(Boolean),
    };
  });

  let fieldGreeting: DoctorFieldGreeting | null = null;
  if (fieldId) {
    const intel = await loadFieldIntelligenceContext(supabase, ctx.organizationId, fieldId);
    if (intel) {
      fieldGreeting = {
        fieldId: intel.fieldId,
        fieldName: intel.fieldName,
        locationLabel: intel.locationLabel ?? null,
        crop: intel.cropsOnField?.[0] ?? null,
      };
    }
  }

  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">{common.loadingDoctor}</p>}>
      <DoctorChatApp
        email={ctx.email}
        organizationName={ctx.organizationName}
        tier={ctx.tier}
        fields={fields}
        fieldGreeting={fieldGreeting}
        locale={locale}
      />
    </Suspense>
  );
}
