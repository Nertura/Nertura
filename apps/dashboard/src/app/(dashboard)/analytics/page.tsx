import { Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';

import { PageHeader, StatCard } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';
import { OPS_COPY } from '@/lib/i18n/ops-copy';
import { createClient } from '@/lib/supabase/server';

export default async function AnalyticsPage() {
  const copy = OPS_COPY.analytics;
  const ctx = await getDashboardContext();
  const supabase = await createClient();
  const orgId = ctx.organizationId;

  const [farmsRes, fieldsRes, cropsRes, areaRes] = await Promise.all([
    supabase.from('farms').select('status').eq('organization_id', orgId).is('deleted_at', null),
    supabase.from('fields').select('area, status').eq('organization_id', orgId).is('deleted_at', null),
    supabase.from('crops').select('crop_name, status, target_yield, yield_unit').eq('organization_id', orgId).is('deleted_at', null),
    supabase.from('farms').select('total_area').eq('organization_id', orgId).is('deleted_at', null),
  ]);

  const fields = fieldsRes.data ?? [];
  const crops = cropsRes.data ?? [];
  const fieldAreaTotal = fields.reduce((sum, f) => sum + (Number(f.area) || 0), 0);
  const farmAreaTotal = (areaRes.data ?? []).reduce((sum, f) => sum + (Number(f.total_area) || 0), 0);

  const cropByStatus = crops.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  const cropByName = crops.reduce<Record<string, number>>((acc, c) => {
    acc[c.crop_name] = (acc[c.crop_name] ?? 0) + 1;
    return acc;
  }, {});

  const activeCrops = crops.filter((c) => c.status === 'active' || c.status === 'planned');
  const yieldTarget = activeCrops.reduce((sum, c) => sum + (Number(c.target_yield) || 0), 0);

  const statusLabel = (status: string) => copy.statusLabels[status] ?? status;

  return (
    <div>
      <PageHeader title={copy.title} description={copy.description} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={copy.totalFarms} value={farmsRes.data?.length ?? 0} />
        <StatCard
          label={copy.totalFields}
          value={fields.length}
          hint={copy.mappedHa(fieldAreaTotal.toFixed(1))}
        />
        <StatCard label={copy.farmArea} value={`${farmAreaTotal.toFixed(1)} ha`} />
        <StatCard
          label={copy.activeCrops}
          value={activeCrops.length}
          hint={copy.targetYield(yieldTarget.toFixed(1))}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{copy.cropsByStatus}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(cropByStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.noCropData}</p>
            ) : (
              Object.entries(cropByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{statusLabel(status)}</span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{copy.cropsByType}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(cropByName).length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.noCropData}</p>
            ) : (
              Object.entries(cropByName)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{copy.fieldStatus}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {['active', 'fallow', 'archived'].map((status) => {
                const count = fields.filter((f) => f.status === status).length;
                const pct = fields.length ? Math.round((count / fields.length) * 100) : 0;
                return (
                  <div key={status} className="min-w-[120px] rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">{statusLabel(status)}</p>
                    <p className="text-2xl font-semibold tabular-nums">{count}</p>
                    <p className="text-xs text-muted-foreground">{copy.pctOfFields(pct)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
