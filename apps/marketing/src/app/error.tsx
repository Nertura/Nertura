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
    console.error('[marketing error boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Bir sorun oluştu</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Sayfa yüklenemedi. Lütfen tekrar deneyin.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Tekrar dene
      </Button>
    </div>
  );
}
