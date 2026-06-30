import * as React from 'react';

import { cn } from '../../lib/utils';
import { Input, type InputProps } from '../input';

/** Standard Nertura field input — auth, forms, settings. */
export const AppInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      className={cn('h-11 rounded-xl focus-visible:ring-primary/30', className)}
      {...props}
    />
  )
);
AppInput.displayName = 'AppInput';
