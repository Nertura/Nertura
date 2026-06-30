import Link from 'next/link';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';
import { Map, MessageCircle, Plus } from 'lucide-react';

import { StatusBadge } from '@/components/dashboard/page-header';
import { formatFarmArea } from '@/lib/farm/area-units';
import { formatFarmLocation } from '@/lib/farm/location';
import type { Farm } from '@nertura/types';

export interface FarmCardData extends Farm {
  fieldCount: number;
}

interface FarmHubCardProps {
  farm: FarmCardData;
}

export function FarmHubCard({ farm }: FarmHubCardProps) {
  const location = formatFarmLocation(farm);
  const areaLabel = formatFarmArea(farm.total_area, farm.area_unit, farm.metadata);

  return (
    <Card className="flex flex-col transition-colors hover:border-signal/40">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-snug">{farm.name}</CardTitle>
          <StatusBadge status={farm.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
        {location && <p>{location}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {areaLabel && <span>{areaLabel}</span>}
          <span>
            {farm.fieldCount} field{farm.fieldCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link href={`/farms/${farm.id}/map`}>
            <Button size="sm">
              <Map className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Open map
            </Button>
          </Link>
          <Link href={`/farms/${farm.id}/map?draw=1`}>
            <Button size="sm" variant="secondary">
              <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Add field
            </Button>
          </Link>
          <Link href="/doctor">
            <Button size="sm" variant="outline">
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Ask AI Doctor
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
