'use client';

import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

interface NerturaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { mark: 'h-8 w-8 text-sm', word: 'text-lg' },
  md: { mark: 'h-10 w-10 text-base', word: 'text-xl' },
  lg: { mark: 'h-16 w-16 text-2xl', word: 'text-3xl' },
  xl: { mark: 'h-[4.5rem] w-[4.5rem] text-3xl', word: 'text-4xl' },
};

export function NerturaLogo({ size = 'md', showWordmark = true, className }: NerturaLogoProps) {
  const s = sizes[size];

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-gradient-to-br from-signal to-emerald-600 font-semibold text-white shadow-md shadow-signal/25',
          s.mark
        )}
        aria-hidden
      >
        N
      </div>
      {showWordmark && (
        <span className={cn('font-semibold tracking-tight text-void', s.word)}>Nertura</span>
      )}
    </div>
  );
}

interface AiChatHeroProps {
  headline?: string;
  subheadline?: string;
  children?: ReactNode;
}

export function AiChatHero({
  headline = 'The AI Brain For Agriculture',
  subheadline = 'Ask anything about your crops, soil, pests, or plant health.',
  children,
}: AiChatHeroProps) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <NerturaLogo size="lg" />
      <h1 className="mt-8 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-void sm:text-4xl">
        {headline}
      </h1>
      <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">{subheadline}</p>
      {children ? <div className="mt-10 w-full max-w-[860px]">{children}</div> : null}
    </div>
  );
}
