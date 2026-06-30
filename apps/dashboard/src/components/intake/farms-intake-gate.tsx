'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Map, Tractor } from 'lucide-react';

import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';

import { buildFarmMapIntakeUrl, parseIntakeHandoffFromSearch } from '@/lib/intake/map-handoff';

export interface FarmsIntakeGateFarm {
  id: string;
  name: string;
  fieldCount: number;
}

export function FarmsIntakeGate({ farms }: { farms: FarmsIntakeGateFarm[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  const handoff = useMemo(() => {
    const raw: Record<string, string | undefined> = {};
    searchParams.forEach((value, key) => {
      raw[key] = value;
    });
    return parseIntakeHandoffFromSearch(raw);
  }, [searchParams]);

  useEffect(() => {
    if (farms.length !== 1 || redirecting) return;
    setRedirecting(true);
    const url = buildFarmMapIntakeUrl(farms[0]!.id, handoff);
    router.replace(url);
  }, [farms, handoff, redirecting, router]);

  if (farms.length === 1) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">Harita açılıyor…</p>
      </div>
    );
  }

  if (farms.length === 0) {
    return (
      <Card className="mx-auto max-w-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Önce bir çiftlik oluşturalım</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tarlanı haritada çizebilmemiz için bir çiftlik kaydı gerekiyor. Intake bilgilerin
            kaybolmayacak.
          </p>
          <Link href="/farms/new?intake=1">
            <Button className="w-full">
              <Tractor className="mr-2 h-4 w-4" />
              Yeni çiftlik oluştur
            </Button>
          </Link>
          <Link href="/intake" className="block text-center text-sm text-primary hover:underline">
            Intake adımına dön
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Bu sorun hangi çiftlik/alan için?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Doğru çiftliği seç; tarla haritasına intake bilgilerinle birlikte geçeceğiz.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {farms.map((farm) => (
          <Button
            key={farm.id}
            type="button"
            variant="outline"
            className="h-auto w-full justify-start px-4 py-3 text-left"
            onClick={() => {
              router.push(buildFarmMapIntakeUrl(farm.id, handoff));
            }}
          >
            <Map className="mr-3 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block font-medium">{farm.name}</span>
              <span className="text-xs text-muted-foreground">
                {farm.fieldCount} tarla
              </span>
            </span>
          </Button>
        ))}
        <Alert className="mt-4">
          <AlertDescription className="text-xs">
            Yanlış çiftlik mi?{' '}
            <Link href="/farms/new?intake=1" className="font-medium text-primary hover:underline">
              Yeni çiftlik ekle
            </Link>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
