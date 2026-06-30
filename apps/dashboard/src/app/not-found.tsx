import Link from 'next/link';

import { buttonVariants, cn } from '@nertura/ui';

import { OPS_COPY } from '@/lib/i18n/ops-copy';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">{OPS_COPY.errors.notFoundTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{OPS_COPY.errors.notFoundBody}</p>
      <Link href="/doctor" className={cn(buttonVariants(), 'mt-6')}>
        {OPS_COPY.errors.goToDoctor}
      </Link>
    </div>
  );
}
