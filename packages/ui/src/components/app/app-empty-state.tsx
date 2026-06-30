import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

interface AppEmptyStateProps {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function AppEmptyState({ title, description, action, className }: AppEmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center',
        className
      )}
    >
      {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
      <p className={cn('text-sm text-muted-foreground', title && 'mt-1')}>{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
