import type { FormHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/utils';

interface AppComposerShellProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

/** Shared chat composer container — landing + doctor. */
export function AppComposerShell({ children, className, ...props }: AppComposerShellProps) {
  return (
    <form
      className={cn('chat-input-shell flex items-end gap-2 p-2.5 sm:p-3', className)}
      {...props}
    >
      {children}
    </form>
  );
}
