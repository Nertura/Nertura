import { UpgradeModalProvider } from '@/components/billing/upgrade-modal-provider';
import { DashboardShell } from '@/components/dashboard/shell';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { TierProvider } from '@/components/dashboard/tier-provider';
import { getDashboardContext } from '@/lib/auth/context';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getDashboardContext();

  return (
    <UpgradeModalProvider>
      <TierProvider tier={ctx.tier}>
        <DashboardShell ctx={ctx}>{children}</DashboardShell>
        <div className="h-16 lg:hidden" aria-hidden />
        <MobileNav />
      </TierProvider>
    </UpgradeModalProvider>
  );
}
