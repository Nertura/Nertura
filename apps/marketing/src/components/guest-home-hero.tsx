'use client';

import type { ReactNode } from 'react';

import { NerturaLogo } from '@nertura/ui';

interface GuestHomeHeroProps {
  headline: string;
  children?: ReactNode;
}

export function GuestHomeHero({ headline, children }: GuestHomeHeroProps) {
  return (
    <div className="flex w-full max-w-[960px] flex-col items-center text-center animate-fade-in">
      <NerturaLogo size="xl" />
      <h1 className="mt-4 w-full max-w-[min(100%,52rem)] text-balance font-semibold leading-tight tracking-tight text-foreground [font-size:clamp(1.25rem,1.4vw+0.75rem,1.875rem)] md:whitespace-nowrap">
        {headline}
      </h1>
      {children ? <div className="mt-5 w-full sm:mt-6">{children}</div> : null}
    </div>
  );
}
