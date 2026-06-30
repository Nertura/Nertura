import Link from 'next/link';
import { headers } from 'next/headers';

import { PageHeader } from '@/components/dashboard/page-header';
import { PlanComparisonTable } from '@/components/billing/plan-comparison-table';
import { BuyCreditsPanel } from '@/components/billing/buy-credits-panel';
import { getDashboardContext } from '@/lib/auth/context';
import { getUserUsage } from '@/lib/ai/usage-limits';
import { SUBSCRIPTION_TIERS } from '@/lib/billing/subscription-tiers';
import { OPS_COPY } from '@/lib/i18n/ops-copy';
import { isStripeConfigured } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import { dashboardContextFromHeaders, getMarketingBaseUrl } from '@nertura/utils';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Sahip',
  admin: 'Yönetici',
  manager: 'Müdür',
  operator: 'Operatör',
  viewer: 'Görüntüleyici',
};

export default async function AccountPage() {
  const copy = OPS_COPY.account;
  const ctx = await getDashboardContext();
  const supabase = await createClient();
  const usage = await getUserUsage(supabase, ctx.userId, ctx.organizationId);
  const tier = ctx.tier;
  const plan = SUBSCRIPTION_TIERS[tier];

  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('id, amount, balance_after, transaction_type, description, created_at')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })
    .limit(20);

  const marketingUrl = getMarketingBaseUrl(dashboardContextFromHeaders(await headers()));

  return (
    <div className="p-4 lg:p-8">
      <PageHeader title={copy.title} description={copy.description} />

      <dl className="mt-6 max-w-lg space-y-4 rounded-lg border bg-card p-6 text-sm">
        <div>
          <dt className="text-muted-foreground">{copy.email}</dt>
          <dd className="font-medium text-void">{ctx.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{copy.organization}</dt>
          <dd className="font-medium text-void">{ctx.organizationName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{copy.role}</dt>
          <dd className="font-medium text-void">{ROLE_LABELS[ctx.role] ?? ctx.role}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{copy.subscription}</dt>
          <dd className="font-medium text-void">{plan.name}</dd>
          <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
        </div>
        <div>
          <dt className="text-muted-foreground">{copy.analysesRemaining}</dt>
          <dd className="text-2xl font-bold text-void">{usage.remaining}</dd>
          <p className="mt-1 text-xs text-muted-foreground">{copy.analysesHint}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {copy.analysesUsed(usage.used, usage.limit)}
          </p>
        </div>
      </dl>

      <section className="mt-10 max-w-4xl">
        <h2 className="text-lg font-semibold text-void">{copy.comparePlans}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ödeme entegrasyonu yakında. Planlar şimdilik mimari olarak tanımlıdır.
        </p>
        <div className="mt-4">
          <PlanComparisonTable currentTier={tier} />
        </div>
      </section>

      <section className="mt-10 max-w-3xl" id="analyses">
        <h2 className="text-lg font-semibold text-void">{copy.buyAnalyses}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy.buyAnalysesHint}</p>
        <div className="mt-4">
          <BuyCreditsPanel stripeEnabled={isStripeConfigured()} />
        </div>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold text-void">{copy.billingHistory}</h2>
        <p className="mt-2 rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
          {copy.billingPlaceholder}
        </p>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold text-void">{copy.transactionHistory}</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{copy.date}</th>
                <th className="px-4 py-3">{copy.type}</th>
                <th className="px-4 py-3">{copy.amount}</th>
                <th className="px-4 py-3">{copy.balance}</th>
                <th className="px-4 py-3">{copy.transactionDescription}</th>
              </tr>
            </thead>
            <tbody>
              {(transactions ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {copy.noTransactions}
                  </td>
                </tr>
              )}
              {(transactions ?? []).map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(t.created_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">{t.transaction_type}</td>
                  <td className="px-4 py-3 font-medium">
                    {t.amount > 0 ? `+${t.amount}` : t.amount}
                  </td>
                  <td className="px-4 py-3">{t.balance_after}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/doctor" className="font-medium text-primary hover:underline">
            {copy.backToDoctor}
          </Link>
          {' · '}
          <a href={`${marketingUrl}/delete-account`} className="hover:underline">
            {copy.deleteAccount}
          </a>
        </p>
      </section>
    </div>
  );
}
