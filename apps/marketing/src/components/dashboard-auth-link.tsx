'use client';

import type { ReactNode } from 'react';

import { cn } from '@nertura/ui';

interface DashboardAuthAnchorProps {
  href: string;
  ready: boolean;
  className?: string;
  children: ReactNode;
}

/** External dashboard link — blocked until LAN-aware href is ready (no localhost leak). */
export function DashboardAuthAnchor({ href, ready, className, children }: DashboardAuthAnchorProps) {
  return (
    <a
      href={ready ? href : undefined}
      aria-disabled={!ready}
      tabIndex={ready ? 0 : -1}
      onClick={(event) => {
        if (!ready) event.preventDefault();
      }}
      className={cn(!ready && 'pointer-events-none', className)}
    >
      {children}
    </a>
  );
}
