import Link from 'next/link';

import { buttonVariants, cn } from '@nertura/ui';

import { getDashboardContext } from '@/lib/auth/context';
import { getUserUsage } from '@/lib/ai/usage-limits';
import { OPS_COPY } from '@/lib/i18n/ops-copy';
import { createClient } from '@/lib/supabase/server';

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const copy = OPS_COPY.billing;
  const params = await searchParams;
  const ctx = await getDashboardContext();
  const supabase = await createClient();
  const usage = await getUserUsage(supabase, ctx.userId, ctx.organizationId);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-void">{copy.successTitle}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{copy.successBody}</p>
      <p className="mt-2 text-sm font-medium text-void">{copy.currentBalance(usage.remaining)}</p>
      {params.session_id && (
        <p className="mt-1 text-xs text-muted-foreground">
          {copy.reference}: {params.session_id.slice(0, 20)}…
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <Link href="/doctor" className={cn(buttonVariants(), 'min-w-[140px]')}>
          {copy.askDoctor}
        </Link>
        <Link href="/account" className={cn(buttonVariants({ variant: 'outline' }), 'min-w-[140px]')}>
          {copy.viewAccount}
        </Link>
      </div>
    </div>
  );
}
