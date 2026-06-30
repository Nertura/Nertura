import * as React from 'react';

import { cn } from '../../lib/utils';

export interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/** Composer and form textarea — matches chat input typography. */
export const AppTextarea = React.forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex w-full resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50 sm:text-[16px]',
        className
      )}
      {...props}
    />
  )
);
AppTextarea.displayName = 'AppTextarea';

/** Shared composer textarea height — 52–58px initial row. */
export const composerTextareaClassName =
  'max-h-40 min-h-[52px] flex-1 px-2 py-3 sm:min-h-[56px]';
