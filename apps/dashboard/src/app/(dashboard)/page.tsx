import { AgricultureOsHome } from '@/components/home/agriculture-os-home';
import { getDashboardContext } from '@/lib/auth/context';
import { loadDashboardHomeData } from '@/lib/field-intelligence/home-loader';
import { getUserLocale } from '@/lib/i18n/user-locale';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardHomePage() {
  const ctx = await getDashboardContext();
  const supabase = await createClient();
  const locale = await getUserLocale(supabase, ctx.userId);

  const data = await loadDashboardHomeData(
    supabase,
    ctx.organizationId,
    ctx.userId,
    ctx.email,
    ctx.organizationName
  );

  return <AgricultureOsHome data={data} canWrite={ctx.canWrite} locale={locale} />;
}
