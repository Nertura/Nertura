import * as React from 'react';

import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../button';

export interface AppButtonProps extends ButtonProps {
  fullWidth?: boolean;
}

/** Standard Nertura button — consistent height and radius for primary actions. */
export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, fullWidth, size = 'default', ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      className={cn('h-11 rounded-xl', fullWidth && 'w-full', className)}
      {...props}
    />
  )
);
AppButton.displayName = 'AppButton';
