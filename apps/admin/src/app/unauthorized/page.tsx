import Link from 'next/link';

import { buttonVariants, cn } from '@nertura/ui';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <span className="text-2xl" aria-hidden>
          ⛔
        </span>
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-void">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your account is signed in but does not have the platform admin role required for this
        console.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/login" className={cn(buttonVariants(), 'min-w-[200px]')}>
          Sign in with a different account
        </Link>
        <Link
          href="/auth/signout"
          className={cn(buttonVariants({ variant: 'outline' }), 'min-w-[200px]')}
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}
