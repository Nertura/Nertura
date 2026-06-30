'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Activity,
  BookOpen,
  Building2,
  FileUp,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Sparkles,
  Upload,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  ThemeToggle,
  cn,
} from '@nertura/ui';

const NAV_GROUPS = [
  {
    label: 'Dashboard',
    items: [{ href: '/', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    label: 'Users',
    items: [
      { href: '/users', label: 'Users', icon: Users },
      { href: '/organizations', label: 'Organizations', icon: Building2 },
    ],
  },
  {
    label: 'AI',
    items: [
      { href: '/analyses', label: 'Analyses', icon: Activity },
      { href: '/conversations', label: 'Conversations', icon: MessageSquare },
      { href: '/knowledge', label: 'Knowledge Bank', icon: BookOpen },
      { href: '/knowledge-ingestion', label: 'Knowledge Ingestion', icon: Upload },
      { href: '/intelligence', label: 'Intelligence Center', icon: Activity },
      { href: '/intelligence/provider-outputs', label: 'Provider Outputs', icon: FileUp },
      { href: '/intelligence/feedback', label: 'Feedback', icon: MessageSquare },
      { href: '/intelligence/memory-events', label: 'Memory Events', icon: Activity },
      { href: '/intelligence/similar-cases', label: 'Similar Cases', icon: Activity },
      { href: '/intelligence/knowledge-gaps', label: 'Knowledge Gaps', icon: BookOpen },
      { href: '/ai-logs', label: 'AI Logs', icon: FileUp },
    ],
  },
  {
    label: 'Growth AI',
    items: [{ href: '/growth-ai', label: 'Growth AI', icon: Sparkles }],
  },
  {
    label: 'Billing',
    items: [
      { href: '/usage', label: 'Usage', icon: Wallet },
      { href: '/transactions', label: 'Transactions', icon: Wallet },
    ],
  },
  {
    label: 'Security',
    items: [
      { href: '/security-logs', label: 'Audit Logs', icon: Shield },
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/import', label: 'Data Import', icon: Upload },
    ],
  },
] as const;

interface AdminShellProps {
  children: ReactNode;
  userEmail?: string | null;
}

function NavGroups({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-signal/10 text-void'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized';
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="border-b px-6 py-4">
          <p className="text-lg font-semibold text-void">Nertura Admin</p>
          <p className="text-xs text-muted-foreground">Platform control center</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
          <NavGroups pathname={pathname} />
        </nav>
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card shadow-xl lg:hidden">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <p className="font-semibold text-void">Admin</p>
              <button type="button" className="rounded-md p-2 hover:bg-muted" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              <NavGroups pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </nav>
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 hover:bg-muted lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 sm:flex">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate text-sm text-muted-foreground">Search admin…</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {userEmail ? (
              <DropdownMenu
                trigger={
                  <span className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm hover:bg-muted">
                    <span className="hidden max-w-[160px] truncate sm:inline">{userEmail}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-signal/15 text-xs font-semibold text-void">
                      {userEmail.slice(0, 2).toUpperCase()}
                    </span>
                  </span>
                }
              >
                <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
                <DropdownMenuLabel className="pt-0">Platform Admin</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem href="/settings">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem href="/auth/signout" destructive>
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signout" className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            )}
          </div>
        </header>

        <main id="main-content" className="min-w-0 flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-void">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-8 rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Module ready — extend CRUD in next sprint.
      </div>
    </div>
  );
}

export { AdminPlaceholder };
