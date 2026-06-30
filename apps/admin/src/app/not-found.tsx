import Link from 'next/link';

import { buttonVariants, cn } from '@nertura/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This admin page does not exist.</p>
      <Link href="/" className={cn(buttonVariants(), 'mt-6')}>
        Control center
      </Link>
    </div>
  );
}
