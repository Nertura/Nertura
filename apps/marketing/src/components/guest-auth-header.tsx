'use client';



import Link from 'next/link';



import { NerturaLogo, ThemeToggle, buttonVariants, cn } from '@nertura/ui';



import { DashboardAuthAnchor } from '@/components/dashboard-auth-link';

import { MARKETING_COPY, useMarketingLocale } from '@/lib/use-marketing-locale';

import { useDashboardUrls } from '@/lib/use-dashboard-urls';



interface GuestAuthHeaderProps {

  className?: string;

}



export function GuestAuthHeader({ className }: GuestAuthHeaderProps) {

  const locale = useMarketingLocale();

  const copy = MARKETING_COPY[locale];

  const { ready, login, register } = useDashboardUrls({ next: '/doctor' });



  return (

    <header

      className={cn(

        'sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6',

        className

      )}

    >

      <Link href="/" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">

        <NerturaLogo size="sm" />

      </Link>



      <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Account">

        <ThemeToggle />

        <DashboardAuthAnchor

          href={login}

          ready={ready}

          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-muted-foreground')}

        >

          {copy.login}

        </DashboardAuthAnchor>

        <DashboardAuthAnchor

          href={register}

          ready={ready}

          className={cn(buttonVariants({ size: 'sm' }), 'shadow-sm text-xs sm:text-sm')}

        >

          {copy.signup}

        </DashboardAuthAnchor>

      </nav>

    </header>

  );

}

