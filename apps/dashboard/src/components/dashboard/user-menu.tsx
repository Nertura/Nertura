'use client';

import {
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  ThemeToggle,
  cn,
} from '@nertura/ui';

import { getDashboardCopy, type DashboardLocale } from '@/lib/i18n/dashboard-copy';

interface UserMenuProps {
  email: string;
  organizationName?: string;
  creditsRemaining?: number | null;
  compact?: boolean;
  className?: string;
  locale?: DashboardLocale;
}

function initials(email: string): string {
  const part = email.split('@')[0] ?? 'U';
  return part.slice(0, 2).toUpperCase();
}

export function UserMenu({
  email,
  organizationName,
  creditsRemaining,
  compact,
  className,
  locale = 'tr',
}: UserMenuProps) {
  const menu = getDashboardCopy(locale).userMenu;

  return (
    <DropdownMenu
      className={className}
      triggerClassName={cn(
        'flex items-center gap-2 transition-colors',
        compact && 'rounded-lg px-1 py-1 hover:bg-muted/60',
        !compact && 'rounded-lg border bg-card px-2 py-1.5 hover:bg-muted'
      )}
      trigger={
        <>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal/15 text-xs font-semibold text-void"
            aria-hidden
          >
            {initials(email)}
          </span>
          {!compact && (
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-medium text-void">{email}</span>
              {organizationName && (
                <span className="block truncate text-xs text-muted-foreground">
                  {organizationName}
                  {creditsRemaining != null
                    ? ` · ${menu.analysesRemaining(creditsRemaining)}`
                    : ''}
                </span>
              )}
            </span>
          )}
        </>
      }
    >
      <DropdownMenuLabel>{email}</DropdownMenuLabel>
      {organizationName && (
        <DropdownMenuLabel className="pt-0 text-foreground">{organizationName}</DropdownMenuLabel>
      )}
      {creditsRemaining != null && (
        <DropdownMenuLabel className="pt-0 text-signal">
          {menu.analysesRemaining(creditsRemaining)}
        </DropdownMenuLabel>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem href="/account">
        <User className="h-4 w-4" />
        {menu.profile}
      </DropdownMenuItem>
      <DropdownMenuItem href="/account">
        <User className="h-4 w-4" />
        {menu.account}
      </DropdownMenuItem>
      <DropdownMenuItem href="/settings">
        <Settings className="h-4 w-4" />
        {menu.settings}
      </DropdownMenuItem>
      <DropdownMenuItem href="/account">
        <Sparkles className="h-4 w-4" />
        {menu.analysesCredits}
      </DropdownMenuItem>
      <DropdownMenuItem href="/account">
        <CreditCard className="h-4 w-4" />
        {menu.subscription}
      </DropdownMenuItem>
      <DropdownMenuItem href="mailto:support@nertura.com">
        <HelpCircle className="h-4 w-4" />
        {menu.help}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <div className="px-3 py-2">
        <ThemeToggle showLabel className="w-full justify-start px-0" />
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem href="/auth/signout" destructive>
        <LogOut className="h-4 w-4" />
        {menu.logout}
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
