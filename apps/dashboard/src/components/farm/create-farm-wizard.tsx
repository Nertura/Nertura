'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  LocateFixed,
  MapPin,
  Tractor,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  cn,
} from '@nertura/ui';

import {
  FARM_AREA_UNIT_OPTIONS,
  FARM_SITE_TYPE_OPTIONS,
  type CreateFarmPayload,
  type FarmAreaUnitInput,
  type FarmSiteType,
} from '@/lib/farm/types';
import { getDashboardCopy } from '@/lib/i18n/dashboard-copy';
import { COUNTRY_OPTIONS } from '@/lib/onboarding/types';

import { buildFarmMapIntakeUrlFromSession } from '@/lib/intake/map-handoff';

const STEPS = [
  { id: 'basics', label: 'Farm details' },
  { id: 'area', label: 'Size' },
  { id: 'location', label: 'Location' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const INITIAL: CreateFarmPayload = {
  name: '',
  countryCode: 'TR',
  city: '',
  district: '',
  siteType: 'farm',
  totalArea: null,
  areaUnit: 'hectare',
  latitude: null,
  longitude: null,
};

export function CreateFarmWizard({ intakeMode = false }: { intakeMode?: boolean }) {
  const optionalLabel = getDashboardCopy('tr').createFarm.optional;
  const router = useRouter();
  const [step, setStep] = useState<StepId>('basics');
  const [form, setForm] = useState<CreateFarmPayload>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch(partial: Partial<CreateFarmPayload>) {
    setForm((f) => ({ ...f, ...partial }));
  }

  function validateStep(current: StepId): string | null {
    if (current === 'basics') {
      if (!form.name.trim()) return 'Farm name is required.';
      if (!form.city.trim()) return 'City is required.';
      if (!form.district.trim()) return 'District is required.';
    }
    return null;
  }

  function goNext() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]!.id);
  }

  function goBack() {
    setError(null);
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1]!.id);
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        patch({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. You can continue without GPS coordinates.');
        } else {
          setGeoError('Could not retrieve your location. Try again or skip this step.');
        }
      },
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  async function submit() {
    const msg = validateStep('basics');
    if (msg) {
      setError(msg);
      setStep('basics');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Çiftlik oluşturulamadı');
      const farmId = json.farm?.id as string | undefined;
      if (intakeMode && farmId) {
        router.push(buildFarmMapIntakeUrlFromSession(farmId));
        return;
      }
      router.push(json.redirectTo ?? `/farms/${farmId}/map`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className="hidden text-xs text-muted-foreground sm:inline">{s.label}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tractor className="h-5 w-5 text-signal" aria-hidden />
            {step === 'basics' && 'Farm details'}
            {step === 'area' && 'Operation size'}
            {step === 'location' && 'Map location'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'basics' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="farm-name">Farm name *</Label>
                <Input
                  id="farm-name"
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Green Valley Farm"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <select
                  id="country"
                  value={form.countryCode}
                  onChange={(e) => patch({ countryCode: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => patch({ city: e.target.value })}
                    placeholder="Ankara"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={form.district}
                    onChange={(e) => patch({ district: e.target.value })}
                    placeholder="Polatlı"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Site type *</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {FARM_SITE_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => patch({ siteType: opt.id as FarmSiteType })}
                      className={cn(
                        'rounded-lg border p-3 text-left text-sm transition-colors',
                        form.siteType === opt.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:border-muted-foreground/40'
                      )}
                    >
                      <span className="font-medium">{opt.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{opt.labelTr}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'area' && (
            <>
              <p className="text-sm text-muted-foreground">
                Total operation size is optional. You can refine individual field areas on the map next.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="total-area">Total area</Label>
                  <Input
                    id="total-area"
                    type="number"
                    min={0}
                    step="any"
                    value={form.totalArea ?? ''}
                    onChange={(e) =>
                      patch({
                        totalArea: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder={optionalLabel}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area-unit">Unit</Label>
                  <select
                    id="area-unit"
                    value={form.areaUnit}
                    onChange={(e) => patch({ areaUnit: e.target.value as FarmAreaUnitInput })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {FARM_AREA_UNIT_OPTIONS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 'location' && (
            <>
              <p className="text-sm text-muted-foreground">
                Pin your farm on the map for better AI recommendations. You can skip and set this later.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={useMyLocation}
                disabled={geoLoading}
              >
                {geoLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LocateFixed className="mr-2 h-4 w-4" />
                )}
                Use my location
              </Button>
              {form.latitude != null && form.longitude != null && (
                <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
                  <div>
                    <p className="font-medium">Location saved</p>
                    <p className="tabular-nums text-muted-foreground">
                      {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                    </p>
                  </div>
                </div>
              )}
              {geoError && (
                <Alert variant="destructive">
                  <AlertDescription>{geoError}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {stepIndex > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Link href="/farms">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            )}
            {step !== 'location' ? (
              <Button type="button" onClick={goNext}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Create farm & open map
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
