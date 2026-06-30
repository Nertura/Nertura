'use client';



import Link from 'next/link';

import { usePathname } from 'next/navigation';

import type { ReactNode } from 'react';

import { Lock, LogOut, Menu, X } from 'lucide-react';

import { useState } from 'react';



import { cn, buttonVariants, OverlayPortal } from '@nertura/ui';



import { useUpgradeModal } from '@/components/billing/upgrade-modal-provider';

import { DashboardTopBar } from '@/components/dashboard/top-bar';

import { isNavActive } from '@/lib/navigation';

import {

  getTierNavigation,

  isNavItemLocked,

  type TierNavItem,

} from '@/lib/navigation-tier';

import type { DashboardContext } from '@/lib/auth/context';



interface DashboardShellProps {

  ctx: DashboardContext;

  children: ReactNode;

}



function NavItemButton({

  item,

  locked,

  active,

  onLockedClick,

  onNavigate,

}: {

  item: TierNavItem;

  locked: boolean;

  active: boolean;

  onLockedClick: () => void;

  onNavigate?: () => void;

}) {

  const Icon = item.icon;

  const className = cn(

    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',

    active && !locked

      ? 'bg-signal/10 text-void'

      : 'text-muted-foreground hover:bg-muted hover:text-foreground',

    locked && 'opacity-80'

  );



  if (locked) {

    return (

      <button type="button" onClick={onLockedClick} className={className}>

        <Icon className="h-4 w-4 shrink-0" aria-hidden />

        <span className="flex-1 text-left">{item.label}</span>

        <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />

      </button>

    );

  }



  return (

    <Link

      href={item.href}

      onClick={onNavigate}

      className={className}

      aria-current={active ? 'page' : undefined}

    >

      <Icon className="h-4 w-4 shrink-0" aria-hidden />

      {item.label}

    </Link>

  );

}



export function DashboardShell({ ctx, children }: DashboardShellProps) {

  const pathname = usePathname();

  const isDoctorFocus = pathname === '/doctor' || pathname.startsWith('/doctor/');

  const [mobileOpen, setMobileOpen] = useState(false);

  const { openUpgrade } = useUpgradeModal();



  const tier = ctx.tier;

  const navItems = getTierNavigation(tier);



  if (isDoctorFocus) {

    return <div className="min-h-screen bg-background">{children}</div>;

  }



  return (

    <div className="flex min-h-screen bg-background">

      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">

        <div className="flex h-16 flex-col justify-center border-b px-6">

          <Link href="/doctor" className="group">

            <p className="truncate text-lg font-semibold text-void group-hover:text-primary">Nertura</p>

            <p className="text-xs text-muted-foreground">AI Tarım Danışmanı</p>

          </Link>

        </div>



        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Ana menü">

          {navItems.map((item) => {

            const locked = isNavItemLocked(item, tier);

            const active = !locked && isNavActive(pathname, item.href);

            return (

              <NavItemButton

                key={item.href}

                item={item}

                locked={locked}

                active={active}

                onLockedClick={openUpgrade}

              />

            );

          })}

        </nav>



        <div className="border-t p-4">

          <p className="truncate text-xs text-muted-foreground">{ctx.email}</p>

          <Link

            href="/auth/signout"

            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mt-2 w-full gap-2')}

          >

            <LogOut className="h-4 w-4" />

            Çıkış yap

          </Link>

        </div>

      </aside>



      {mobileOpen && (

        <OverlayPortal>

          <button

            type="button"

            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] lg:hidden"

            aria-label="Menüyü kapat"

            onClick={() => setMobileOpen(false)}

          />

          <aside className="fixed inset-y-0 left-0 z-[70] flex w-72 flex-col border-r bg-card shadow-xl lg:hidden">

            <div className="flex h-14 items-center justify-between border-b px-4">

              <p className="font-semibold text-void">Nertura</p>

              <button

                type="button"

                className="rounded-md p-2 hover:bg-muted"

                aria-label="Menüyü kapat"

                onClick={() => setMobileOpen(false)}

              >

                <X className="h-5 w-5" />

              </button>

            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Mobil menü">

              {navItems.map((item) => {

                const locked = isNavItemLocked(item, tier);

                const active = !locked && isNavActive(pathname, item.href);

                return (

                  <NavItemButton

                    key={item.href}

                    item={item}

                    locked={locked}

                    active={active}

                    onLockedClick={() => {

                      openUpgrade();

                      setMobileOpen(false);

                    }}

                    onNavigate={() => setMobileOpen(false)}

                  />

                );

              })}

            </nav>

          </aside>

        </OverlayPortal>

      )}



      <div className="flex min-h-0 min-w-0 flex-1 flex-col">

        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">

          <div className="flex items-center gap-3">

            <button

              type="button"

              className="rounded-md p-2 hover:bg-muted lg:hidden"

              aria-label="Menüyü aç"

              onClick={() => setMobileOpen(true)}

            >

              <Menu className="h-5 w-5" />

            </button>

            <Link href="/doctor" className="font-semibold text-void lg:hidden">

              Nertura

            </Link>

          </div>

          <DashboardTopBar email={ctx.email} organizationName={ctx.organizationName} />

        </header>

        <main id="main-content" className="relative z-0 min-h-0 flex-1">

          {children}

        </main>

      </div>

    </div>

  );

}

