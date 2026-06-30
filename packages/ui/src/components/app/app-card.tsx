import * as React from 'react';

import { cn } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card';

/** Auth and settings card shell — consistent radius and shadow. */
export function AppCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        'rounded-3xl border-border/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
        className
      )}
      {...props}
    />
  );
}

export { CardContent as AppCardContent, CardDescription as AppCardDescription, CardFooter as AppCardFooter, CardHeader as AppCardHeader, CardTitle as AppCardTitle };
