import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle, Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';

import { PageHeader } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';
import { OPS_COPY } from '@/lib/i18n/ops-copy';
import { createClient } from '@/lib/supabase/server';
import { fetchWeather, weatherLabel } from '@/lib/weather/open-meteo';
import type { Farm } from '@nertura/types';

export default async function WeatherPage({
  searchParams,
}: {
  searchParams: Promise<{ farm?: string }>;
}) {
  const copy = OPS_COPY.weather;
  const { farm: farmIdParam } = await searchParams;
  const ctx = await getDashboardContext();
  const supabase = await createClient();

  const { data: farms } = await supabase
    .from('farms')
    .select('*')
    .eq('organization_id', ctx.organizationId)
    .is('deleted_at', null)
    .order('name');

  const farmList = (farms ?? []) as Farm[];
  const selectedFarm =
    farmList.find((f) => f.id === farmIdParam) ??
    farmList.find((f) => f.latitude != null && f.longitude != null);

  let weather = null;
  let weatherError: string | null = null;

  if (selectedFarm?.latitude != null && selectedFarm?.longitude != null) {
    try {
      const data = await fetchWeather(Number(selectedFarm.latitude), Number(selectedFarm.longitude));
      weather = { ...data, farmId: selectedFarm.id, farmName: selectedFarm.name };
    } catch {
      weatherError = copy.forecastError;
    }
  }

  return (
    <div>
      <PageHeader title={copy.title} description={copy.description} />

      {farmList.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {farmList.map((farm) => (
            <Link
              key={farm.id}
              href={`/weather?farm=${farm.id}`}
              className={`rounded-full border px-3 py-1 text-sm ${selectedFarm?.id === farm.id ? 'border-signal bg-signal/10' : 'hover:bg-muted'}`}
            >
              {farm.name}
            </Link>
          ))}
        </div>
      )}

      {!selectedFarm && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {copy.addFarmHint}
          </CardContent>
        </Card>
      )}

      {selectedFarm && (selectedFarm.latitude == null || selectedFarm.longitude == null) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {copy.setCoordinates(selectedFarm.name)}{' '}
            <Link href={`/farms/${selectedFarm.id}/edit`} className="text-primary underline">
              {copy.setCoordinatesLink}
            </Link>{' '}
            {copy.toEnable}
          </CardContent>
        </Card>
      )}

      {weatherError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>{copy.forecastUnavailable}</AlertTitle>
          <AlertDescription>{weatherError}</AlertDescription>
        </Alert>
      )}

      {weather && (
        <>
          {weather.alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {weather.alerts.map((alert) => (
                <Alert key={`${alert.type}-${alert.date}`} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTitle className="capitalize">
                    {alert.type.replace('_', ' ')} {copy.alert}
                  </AlertTitle>
                  <AlertDescription>{alert.message} · {alert.date}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{weather.farmName} — {copy.current}</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8 text-sm">
              <div>
                <p className="text-3xl font-semibold tabular-nums">{weather.current.temperature.toFixed(1)}°C</p>
                <p className="text-muted-foreground">{weatherLabel(weather.current.weatherCode)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{copy.humidity}</p>
                <p className="text-xl font-medium tabular-nums">{weather.current.humidity}%</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {weather.daily.map((day) => (
              <Card key={day.date}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{day.date}</p>
                  <p className="mt-2 text-lg font-semibold tabular-nums">{day.tempMax.toFixed(0)}°</p>
                  <p className="text-sm tabular-nums text-muted-foreground">{day.tempMin.toFixed(0)}° min</p>
                  <p className="mt-2 text-xs">{weatherLabel(day.weatherCode)}</p>
                  <p className="text-xs text-muted-foreground">{day.precipitation.toFixed(1)} mm</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
