import Link from 'next/link';
import { MapPin, MessageSquarePlus, Sprout, Tractor } from 'lucide-react';

import { Button, Card, CardContent } from '@nertura/ui';

import {
  getDashboardCopy,
  type DashboardLocale,
} from '@/lib/i18n/dashboard-copy';

const INTAKE_EXAMPLE =
  "Osmaniye Toprakkale'de 10 dönüm buğday tarlam var, buğday sararıyor.";

interface FarmsEmptyStateProps {
  canWrite: boolean;
  locale?: DashboardLocale;
}

export function FarmsEmptyState({ canWrite, locale = 'tr' }: FarmsEmptyStateProps) {
  const copy = getDashboardCopy(locale).farmsEmpty;
  const intakeHref = `/intake?q=${encodeURIComponent(INTAKE_EXAMPLE)}`;

  return (
    <Card className="overflow-hidden border-dashed">
      <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-signal/10">
          <Tractor className="h-7 w-7 text-signal" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold">{copy.title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{copy.body}</p>
        <ul className="mt-6 grid w-full max-w-sm gap-3 text-left text-sm text-muted-foreground">
          <li className="flex gap-2">
            <MessageSquarePlus className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
            {copy.bulletIntake}
          </li>
          <li className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
            {copy.bulletMap}
          </li>
          <li className="flex gap-2">
            <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
            {copy.bulletCases}
          </li>
        </ul>
        {canWrite && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={intakeHref}>
              <Button size="lg" variant="default">
                {copy.describeProblem}
              </Button>
            </Link>
            <Link href="/farms/new">
              <Button size="lg" variant="outline">
                {copy.createFarm}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
