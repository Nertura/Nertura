import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

interface AppBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'primary';
  className?: string;
}

/** Secondary status badge — analysis limits, tags, metadata. */
export function AppBadge({ children, variant = 'default', className }: AppBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'subtle' && 'bg-muted/60 text-muted-foreground',
        variant === 'primary' && 'bg-primary/10 text-primary',
        variant === 'default' && 'bg-muted/80 text-muted-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}
