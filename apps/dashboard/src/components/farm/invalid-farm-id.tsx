import Link from 'next/link';

import { Button, Card, CardContent } from '@nertura/ui';
import { AlertTriangle } from 'lucide-react';

interface InvalidFarmIdHintProps {
  id: string;
}

export function InvalidFarmIdHint({ id }: InvalidFarmIdHintProps) {
  return (
    <Card className="mx-auto max-w-lg border-dashed">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <AlertTriangle className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden />
        <h2 className="text-lg font-semibold">Farm not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{id}</code> is not a valid
          farm ID. Farm links use UUIDs assigned when you create a farm — not numbers like{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">1</code>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/farms">
            <Button>Go to My Farm</Button>
          </Link>
          <Link href="/farms/new">
            <Button variant="outline">Create a farm</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
