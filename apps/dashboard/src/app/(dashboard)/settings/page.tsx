import Link from 'next/link';
import { headers } from 'next/headers';

import { PageHeader } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';
import { OPS_COPY } from '@/lib/i18n/ops-copy';
import { buttonVariants, cn } from '@nertura/ui';
import { dashboardContextFromHeaders, getMarketingBaseUrl } from '@nertura/utils';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Sahip',
  admin: 'Yönetici',
  manager: 'Müdür',
  operator: 'Operatör',
  viewer: 'Görüntüleyici',
};

export default async function SettingsPage() {
  const copy = OPS_COPY.settings;
  const ctx = await getDashboardContext();
  const marketingUrl = getMarketingBaseUrl(dashboardContextFromHeaders(await headers()));

  return (
    <div className="p-4 lg:p-8">
      <PageHeader title={copy.title} description={copy.description} />

      <div className="mt-6 max-w-lg space-y-6">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold text-void">{copy.profile}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{OPS_COPY.account.email}</dt>
              <dd className="font-medium text-void">{ctx.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{OPS_COPY.account.organization}</dt>
              <dd className="font-medium text-void">{ctx.organizationName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{OPS_COPY.account.role}</dt>
              <dd className="font-medium text-void">{ROLE_LABELS[ctx.role] ?? ctx.role}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold text-void">{copy.preferences}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.preferencesHint}</p>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold text-void">{copy.language}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.languageHint}</p>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold text-void">{copy.notifications}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.notificationsHint}</p>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold text-void">{copy.security}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.securityHint}</p>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>· {copy.passwordChange} — yakında</li>
            <li>· {copy.emailChange} — yakında</li>
            <li>· {copy.connectedProviders} — yakında</li>
            <li>· {copy.sessions} — yakında</li>
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold text-void">{copy.dataPrivacy}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.dataPrivacyHint}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`${marketingUrl}/delete-account`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.deleteAccount}
            </a>
            <a
              href={`${marketingUrl}/data-export`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.exportData}
            </a>
            <Link
              href={`${marketingUrl}/kvkk`}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              target="_blank"
              rel="noopener noreferrer"
            >
              KVKK
            </Link>
          </div>
        </section>

        <p className="text-sm text-muted-foreground">
          <Link href="/account" className="font-medium text-primary hover:underline">
            {copy.backToAccount}
          </Link>
        </p>
      </div>
    </div>
  );
}
