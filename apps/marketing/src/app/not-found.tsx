import Link from 'next/link';

import { buttonVariants, cn } from '@nertura/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Sayfa bulunamadı</h1>
      <p className="mt-2 text-sm text-muted-foreground">İstediğiniz sayfa mevcut değil.</p>
      <Link href="/" className={cn(buttonVariants(), 'mt-6')}>
        Ana sayfaya dön
      </Link>
    </div>
  );
}
