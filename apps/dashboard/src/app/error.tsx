'use client';

import { useEffect } from 'react';

import { Button } from '@nertura/ui';

import { OPS_COPY } from '@/lib/i18n/ops-copy';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard error boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">{OPS_COPY.errors.title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{OPS_COPY.errors.body}</p>
      <Button className="mt-6" onClick={() => reset()}>
        {OPS_COPY.errors.retry}
      </Button>
    </div>
  );
}
