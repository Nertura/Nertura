'use client';

import { NotificationsBell } from '@/components/dashboard/notifications-bell';
import { UserMenu } from '@/components/dashboard/user-menu';
import { ThemeToggle } from '@nertura/ui';

interface DashboardTopBarProps {
  email: string;
  organizationName?: string;
  /** Show org name in center on desktop */
  showOrg?: boolean;
}

export function DashboardTopBar({ email, organizationName, showOrg = true }: DashboardTopBarProps) {
  return (
    <div className="flex items-center gap-2">
      {showOrg && organizationName && (
        <p className="mr-2 hidden max-w-[200px] truncate text-sm text-muted-foreground lg:block">
          {organizationName}
        </p>
      )}
      <NotificationsBell />
      <ThemeToggle className="hidden sm:inline-flex" />
      <UserMenu email={email} organizationName={organizationName} compact className="sm:hidden" />
      <UserMenu email={email} organizationName={organizationName} className="hidden sm:block" />
    </div>
  );
}

/** Compact variant for chat header trailing slot */
export function DashboardHeaderActions({
  email,
  organizationName,
}: {
  email: string;
  organizationName?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <NotificationsBell />
      <ThemeToggle />
      <UserMenu email={email} organizationName={organizationName} compact />
    </div>
  );
}
