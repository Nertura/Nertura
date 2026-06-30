'use client';

import { useEffect } from 'react';

import { Button } from '@nertura/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin error boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Admin error</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The admin console encountered an error.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
