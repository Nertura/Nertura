'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Sprout,
  Tractor,
} from 'lucide-react';

import type { OrganizationType } from '@nertura/types';
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  cn,
} from '@nertura/ui';
import { slugify } from '@nertura/utils';

import { IntelligenceHeroBanner, IntelligencePreviewCards } from '@/components/onboarding/intelligence-cards';
import { MapPlaceholder } from '@/components/onboarding/map-placeholder';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import {
  formatAreaDisplay,
  getCropLabel,
  getOnboardingCopy,
  getOrgTypeLabel,
  getRegionalIntelligenceHints,
  getSiteTypeLabel,
  toBackendArea,
} from '@/lib/i18n/onboarding-copy';
import {
  COUNTRY_OPTIONS,
  CROP_OPTIONS,
  INITIAL_ONBOARDING_STATE,
  ONBOARDING_STEPS,
  type OnboardingStepId,
  type OnboardingWizardState,
} from '@/lib/onboarding/types';

const LOCALE = 'tr' as const;

const ORG_TYPES: OrganizationType[] = [
  'farm',
  'cooperative',
  'ag_company',
  'supplier',
  'exporter',
];

export function OnboardingWizard() {
  const router = useRouter();
  const copy = getOnboardingCopy(LOCALE);
  const [step, setStep] = useState<OnboardingStepId>('welcome');
  const [state, setState] = useState<OnboardingWizardState>(INITIAL_ONBOARDING_STATE);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slugEdited && state.orgName) {
      setState((s) => ({ ...s, orgSlug: slugify(state.orgName) }));
    }
  }, [state.orgName, slugEdited]);

  function patch(partial: Partial<OnboardingWizardState>) {
    setState((s) => ({ ...s, ...partial }));
  }

  function goNext() {
    const idx = ONBOARDING_STEPS.findIndex((s) => s.id === step);
    if (idx < ONBOARDING_STEPS.length - 1) {
      setStep(ONBOARDING_STEPS[idx + 1]!.id);
      setError(null);
    }
  }

  function goBack() {
    const idx = ONBOARDING_STEPS.findIndex((s) => s.id === step);
    if (idx > 0) {
      setStep(ONBOARDING_STEPS[idx - 1]!.id);
      setError(null);
    }
  }

  function validateStep(): string | null {
    const v = copy.validation;
    switch (step) {
      case 'organization':
        if (!state.orgName.trim()) return v.orgNameRequired;
        if (!state.orgSlug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) return v.invalidSlug;
        return null;
      case 'location':
        if (!state.city.trim()) return v.cityRequired;
        if (state.latitude == null || state.longitude == null) return v.locationRequired;
        return null;
      case 'site':
        if (!state.farmSize || state.farmSize <= 0) return v.areaRequired;
        return null;
      case 'crops':
        if (!state.crops.length) return v.cropsRequired;
        return null;
      default:
        return null;
    }
  }

  async function handleComplete() {
    setError(null);
    setLoading(true);

    const backendArea = toBackendArea(state.farmSize!, state.areaUnit);

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.orgName.trim(),
          slug: state.orgSlug.trim(),
          type: state.orgType,
          countryCode: state.countryCode,
          city: state.city.trim(),
          district: state.district.trim(),
          latitude: state.latitude!,
          longitude: state.longitude!,
          farmSize: backendArea.farmSize,
          areaUnit: backendArea.areaUnit,
          siteType: state.siteType,
          crops: state.crops,
          boundaryGeoJson: state.boundaryGeoJson,
        }),
      });

      const json = (await res.json()) as { error?: string; redirect?: string };
      if (!res.ok) {
        setError(json.error ?? copy.errors.setupFailed);
        setLoading(false);
        return;
      }

      router.push(json.redirect ?? '/doctor');
      router.refresh();
    } catch {
      setError(copy.errors.network);
      setLoading(false);
    }
  }

  function handleNext() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    if (step === 'confirm') {
      void handleComplete();
    } else {
      goNext();
    }
  }

  const hints = getRegionalIntelligenceHints(state, LOCALE);
  const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === step);
  const welcomeIcons = [MapPin, Tractor, Sprout] as const;

  function countryLabel(code: string): string {
    const countries = copy.countries as Record<string, string>;
    return countries[code] ?? code;
  }

  return (
    <OnboardingLayout currentStep={step} locale={LOCALE}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'welcome' && (
        <div className="animate-fade-in space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-signal shadow-lg shadow-signal/20">
              <Sprout className="h-8 w-8 text-void" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-void sm:text-3xl">
              {copy.welcome.title}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              {copy.welcome.subtitle}
            </p>
          </div>
          <IntelligenceHeroBanner locale={LOCALE} />
          <ul className="grid gap-3 sm:grid-cols-3">
            {copy.welcome.features.map(({ title, desc }, i) => {
              const Icon = welcomeIcons[i] ?? Sprout;
              return (
                <li key={title} className="rounded-xl border bg-card p-4 text-center">
                  <Icon className="mx-auto h-5 w-5 text-signal" />
                  <p className="mt-2 text-sm font-medium text-void">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {step === 'organization' && (
        <div className="space-y-6">
          <StepHeader
            icon={Building2}
            title={copy.organization.title}
            description={copy.organization.description}
          />
          <div className="space-y-4 rounded-xl border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">{copy.organization.orgName}</Label>
              <Input
                id="orgName"
                placeholder={copy.organization.orgNamePlaceholder}
                value={state.orgName}
                onChange={(e) => patch({ orgName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgSlug">{copy.organization.orgSlug}</Label>
              <Input
                id="orgSlug"
                placeholder={copy.organization.orgSlugPlaceholder}
                value={state.orgSlug}
                onChange={(e) => {
                  setSlugEdited(true);
                  patch({ orgSlug: e.target.value.toLowerCase() });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgType">{copy.organization.orgType}</Label>
              <select
                id="orgType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={state.orgType}
                onChange={(e) => patch({ orgType: e.target.value as OrganizationType })}
              >
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {getOrgTypeLabel(t, LOCALE)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 'location' && (
        <div className="space-y-6">
          <StepHeader
            icon={MapPin}
            title={copy.location.title}
            description={copy.location.description}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <div className="space-y-2">
                <Label htmlFor="country">{copy.location.country}</Label>
                <select
                  id="country"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={state.countryCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    patch({
                      countryCode: code,
                      areaUnit: code === 'TR' ? 'donum' : state.areaUnit,
                    });
                  }}
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {countryLabel(c.code)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">{copy.location.city}</Label>
                  <Input
                    id="city"
                    placeholder={copy.location.cityPlaceholder}
                    value={state.city}
                    onChange={(e) => patch({ city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">{copy.location.district}</Label>
                  <Input
                    id="district"
                    placeholder={copy.location.districtPlaceholder}
                    value={state.district}
                    onChange={(e) => patch({ district: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">{copy.location.latitude}</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={state.latitude ?? ''}
                    onChange={(e) =>
                      patch({ latitude: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">{copy.location.longitude}</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={state.longitude ?? ''}
                    onChange={(e) =>
                      patch({ longitude: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>
              </div>
            </div>
            <MapPlaceholder
              locale={LOCALE}
              latitude={state.latitude}
              longitude={state.longitude}
              onCoordinatesChange={(lat, lng) => patch({ latitude: lat, longitude: lng })}
              boundaryGeoJson={state.boundaryGeoJson}
              onBoundaryChange={(b) => patch({ boundaryGeoJson: b })}
            />
          </div>
        </div>
      )}

      {step === 'site' && (
        <div className="space-y-6">
          <StepHeader
            icon={Tractor}
            title={copy.site.title}
            description={copy.site.description}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {(['field', 'greenhouse', 'orchard'] as const).map((siteType) => (
              <button
                key={siteType}
                type="button"
                onClick={() => patch({ siteType })}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all',
                  state.siteType === siteType
                    ? 'border-signal bg-signal/10 ring-2 ring-signal/30'
                    : 'bg-card hover:border-signal/40'
                )}
              >
                <p className="font-medium text-void">{copy.siteTypes[siteType].label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.siteTypes[siteType].description}
                </p>
              </button>
            ))}
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="farmSize">{copy.site.totalArea}</Label>
                <Input
                  id="farmSize"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={copy.site.areaPlaceholder}
                  value={state.farmSize ?? ''}
                  onChange={(e) =>
                    patch({ farmSize: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaUnit">{copy.site.unit}</Label>
                <select
                  id="areaUnit"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={state.areaUnit}
                  onChange={(e) =>
                    patch({ areaUnit: e.target.value as 'donum' | 'hectare' | 'acre' })
                  }
                >
                  <option value="donum">{copy.site.units.donum}</option>
                  <option value="hectare">{copy.site.units.hectare}</option>
                  <option value="acre">{copy.site.units.acre}</option>
                </select>
              </div>
            </div>
            {state.boundaryGeoJson && (
              <p className="mt-4 flex items-center gap-2 text-xs text-signal">
                <CheckCircle2 className="h-4 w-4" />
                {copy.site.boundaryReady}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 'crops' && (
        <div className="space-y-6">
          <StepHeader
            icon={Sprout}
            title={copy.crops.title}
            description={copy.crops.description}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {CROP_OPTIONS.map((crop) => {
              const selected = state.crops.includes(crop.id);
              return (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() =>
                    patch({
                      crops: selected
                        ? state.crops.filter((c) => c !== crop.id)
                        : [...state.crops, crop.id],
                    })
                  }
                  className={cn(
                    'flex flex-col items-center rounded-xl border p-4 transition-all',
                    selected
                      ? 'border-signal bg-signal/10 ring-2 ring-signal/30'
                      : 'bg-card hover:border-signal/40'
                  )}
                >
                  <span className="text-2xl" aria-hidden>
                    {crop.emoji}
                  </span>
                  <span className="mt-2 text-sm font-medium text-void">
                    {getCropLabel(crop.id, LOCALE)}
                  </span>
                </button>
              );
            })}
          </div>
          {state.crops.length > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              {copy.crops.selected(state.crops.length)}
            </p>
          )}
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-6">
          <StepHeader
            icon={CheckCircle2}
            title={copy.confirm.title}
            description={copy.confirm.description}
          />
          <div className="rounded-xl border bg-card p-6">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <SummaryItem label={copy.confirm.summary.organization} value={state.orgName} />
              <SummaryItem
                label={copy.confirm.summary.type}
                value={getOrgTypeLabel(state.orgType, LOCALE)}
              />
              <SummaryItem
                label={copy.confirm.summary.location}
                value={[state.district, state.city, countryLabel(state.countryCode)]
                  .filter(Boolean)
                  .join(', ')}
              />
              <SummaryItem
                label={copy.confirm.summary.coordinates}
                value={
                  state.latitude != null
                    ? `${state.latitude.toFixed(4)}, ${state.longitude?.toFixed(4)}`
                    : '—'
                }
              />
              <SummaryItem
                label={copy.confirm.summary.site}
                value={getSiteTypeLabel(state.siteType, LOCALE)}
              />
              <SummaryItem
                label={copy.confirm.summary.area}
                value={formatAreaDisplay(state.farmSize, state.areaUnit, LOCALE)}
              />
              <SummaryItem
                label={copy.confirm.summary.crops}
                value={state.crops.map((id) => getCropLabel(id, LOCALE)).join(', ')}
                className="sm:col-span-2"
              />
            </dl>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-void">{copy.confirm.modulesTitle}</h3>
            <IntelligencePreviewCards cards={hints} locale={LOCALE} />
          </div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4 border-t pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={stepIndex === 0 || loading}
          className={cn(stepIndex === 0 && 'invisible')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {copy.nav.back}
        </Button>
        <Button type="button" onClick={handleNext} disabled={loading} className="min-w-[140px]">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {copy.nav.settingUp}
            </>
          ) : step === 'confirm' ? (
            <>
              {copy.nav.startDoctor}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : step === 'welcome' ? (
            <>
              {copy.nav.getStarted}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              {copy.nav.continue}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </OnboardingLayout>
  );
}

function StepHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-signal/15">
        <Icon className="h-5 w-5 text-signal" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-void">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-void">{value}</dd>
    </div>
  );
}
