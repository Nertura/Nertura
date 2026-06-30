'use client';

import '@nertura/geo/mapbox.css';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Loader2,
  LocateFixed,
  MapPin,
  PenLine,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from 'lucide-react';

import {
  computeMetricsFromPolygonCoords,
  positionsToBoundaryGeoJson,
  type GeocodeSearchResult,
  type LatLng,
} from '@nertura/geo';
import { formatAreaTriple, statedAreaToM2, areaMismatchRatio } from '@nertura/ai';
import type { FarmIntakeParseResult } from '@nertura/ai';
import type { MapViewportTarget } from '@nertura/ui';
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
  MapView,
} from '@nertura/ui';

import { FRIENDLY_BOUNDARY_SAVE_ERROR } from '@/lib/geo/boundary-validation';
import {
  defaultFieldNameFromIntake,
  getFarmMapCopy,
  type MapLocale,
} from '@/lib/farm/farm-map-copy';
import { type FieldSiteType } from '@/lib/farm/types';
import type { FieldMapData } from '@/lib/geo/field-geo';
import { apiFieldToMapData, fieldsToPolygonMap } from '@/lib/geo/field-geo';
import {
  getDashboardGeocodingProvider,
  useGeocodingConfigured,
} from '@/lib/geo/geocoding-provider.client';
import {
  getDashboardMapProvider,
  useMapConfigured,
} from '@/lib/geo/map-provider.client';
import { CROP_OPTIONS } from '@/lib/onboarding/types';

export interface FarmMapClientProps {
  farmId: string;
  farmName: string;
  farmLocation?: string | null;
  initialFields: FieldMapData[];
  canWrite: boolean;
  farmCenter?: LatLng | null;
  autoStartDraw?: boolean;
  initialFieldId?: string | null;
  intakePrefill?: {
    location?: string | null;
    crop?: string | null;
    statedArea?: number | null;
    areaUnit?: string | null;
    symptom?: string | null;
  };
  locale?: MapLocale;
}

type CreatePhase = 'idle' | 'locate' | 'draw' | 'confirm';
type DrawMode = 'create' | 'edit';

const DOCTOR_FIELD_STORAGE_KEY = 'nertura_selected_field_id';
const INTAKE_STORAGE_KEY = 'nertura_farm_intake';
const LARGE_AREA_HA = 500;
const DEFAULT_CENTER: LatLng = { lat: 39.93, lng: 32.85 };

function CompactStepBar({
  step,
  steps,
  ariaLabel,
}: {
  step: 1 | 2 | 3;
  steps: readonly { id: number; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-0.5" role="list" aria-label={ariaLabel}>
      {steps.map((s, i) => (
        <div key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
          <span
            role="listitem"
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:text-xs ${
              s.id === step
                ? 'bg-primary/10 text-primary'
                : s.id < step
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-muted-foreground'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                s.id === step
                  ? 'bg-primary'
                  : s.id < step
                    ? 'bg-emerald-500'
                    : 'bg-muted-foreground/40'
              }`}
              aria-hidden
            />
            <span className="truncate">{s.label}</span>
          </span>
          {i < steps.length - 1 && (
            <span className="mx-0.5 h-px min-w-[6px] flex-1 bg-border" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

function getSimpleStep(phase: CreatePhase): 1 | 2 | 3 {
  if (phase === 'locate') return 1;
  if (phase === 'draw') return 2;
  if (phase === 'confirm') return 3;
  return 1;
}

function resultToViewport(result: GeocodeSearchResult, token: number): MapViewportTarget {
  if (result.bbox) {
    return { bounds: result.bbox, token };
  }
  return { center: result.center, zoom: 14, token };
}

function formatFieldArea(field: FieldMapData): string | null {
  if (field.area_m2 != null) {
    const ha = field.area != null ? ` · ${field.area} ha` : '';
    return `${field.area_m2.toLocaleString()} m²${ha}`;
  }
  if (field.area != null) return `${field.area} ha`;
  return null;
}

export function FarmMapClient({
  farmId,
  farmName,
  farmLocation,
  initialFields,
  canWrite,
  farmCenter,
  autoStartDraw = false,
  initialFieldId = null,
  intakePrefill,
  locale = 'tr',
}: FarmMapClientProps) {
  const copy = useMemo(() => getFarmMapCopy(locale), [locale]);
  const router = useRouter();
  const mapConfigured = useMapConfigured();
  const geocodingConfigured = useGeocodingConfigured();
  const mapProvider = useMemo(() => getDashboardMapProvider(), []);
  const geocodingProvider = useMemo(() => getDashboardGeocodingProvider(), []);

  const [fields, setFields] = useState(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialFields[0]?.id ?? null
  );
  const [phase, setPhase] = useState<CreatePhase>('idle');
  const [drawMode, setDrawMode] = useState<DrawMode>('create');
  const [vertices, setVertices] = useState<LatLng[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [fieldType, setFieldType] = useState<FieldSiteType>('field');
  const [cropName, setCropName] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [statedAreaM2, setStatedAreaM2] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<GeocodeSearchResult[]>([]);
  const [pendingLocation, setPendingLocation] = useState<GeocodeSearchResult | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<GeocodeSearchResult | null>(null);
  const [viewTarget, setViewTarget] = useState<MapViewportTarget | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [largeAreaAcknowledged, setLargeAreaAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const intakeAutoGeocodeRef = useRef(false);
  const initialFieldAppliedRef = useRef(false);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    if (autoStartDraw && canWrite && !initialFieldId) {
      const name = defaultFieldNameFromIntake(locale, intakePrefill);
      setNewFieldName(name);
      setPhase('locate');
      if (intakePrefill?.crop) setCropName(intakePrefill.crop);
      setLocationQuery(intakePrefill?.location ?? farmLocation ?? '');
    }
  }, [autoStartDraw, canWrite, intakePrefill, farmLocation, initialFieldId, locale]);

  useEffect(() => {
    if (!intakePrefill?.location || !canWrite) return;
    setLocationQuery(intakePrefill.location);
    if (intakePrefill.crop) setCropName(intakePrefill.crop);
    if (intakePrefill.statedArea != null) {
      setStatedAreaM2(
        statedAreaToM2(
          intakePrefill.statedArea,
          (intakePrefill.areaUnit as 'donum' | 'hectare' | 'acre' | 'm2') ?? 'donum'
        )
      );
    }
  }, [intakePrefill, canWrite]);

  const mapCenter = useMemo(() => {
    if (confirmedLocation) return confirmedLocation.center;
    if (pendingLocation) return pendingLocation.center;
    return farmCenter ?? DEFAULT_CENTER;
  }, [confirmedLocation, pendingLocation, farmCenter]);

  const mapZoom = useMemo(() => {
    if (confirmedLocation || pendingLocation) return 14;
    return farmCenter ? 14 : 6;
  }, [confirmedLocation, pendingLocation, farmCenter]);

  const polygons = useMemo(() => {
    const base = fieldsToPolygonMap(fields);
    if (vertices.length >= 3) {
      base['draft'] = { coordinates: vertices, label: copy.draft };
    }
    return base;
  }, [fields, vertices, copy.draft]);

  const polylines = useMemo(() => {
    if (vertices.length === 2) {
      return { draft: { coordinates: vertices, label: copy.draftLine } };
    }
    return undefined;
  }, [vertices, copy.draftLine]);

  const draftMetrics = useMemo(() => {
    if (vertices.length < 3) return null;
    return computeMetricsFromPolygonCoords(vertices);
  }, [vertices]);

  const areaTriple = draftMetrics ? formatAreaTriple(draftMetrics.areaM2) : null;

  const areaMismatch =
    statedAreaM2 != null && draftMetrics
      ? areaMismatchRatio(statedAreaM2, draftMetrics.areaM2)
      : 0;
  const showAreaMismatch = areaMismatch > 0.35;

  const isLargeArea =
    draftMetrics != null && draftMetrics.areaHectares > LARGE_AREA_HA;

  const bumpViewport = useCallback((result: GeocodeSearchResult) => {
    setViewTarget((prev) => {
      const next = (prev?.token ?? 0) + 1;
      return resultToViewport(result, next);
    });
  }, []);

  const runSearch = useCallback(
    async (query: string, opts?: { debounced?: boolean }) => {
      const q = query.trim();
      if (!q) {
        if (!opts?.debounced) setError(copy.searchEmpty);
        return;
      }
      const requestId = ++searchRequestRef.current;
      setError(null);
      setInfoMessage(null);
      setSearchLoading(true);
      if (!opts?.debounced) {
        setSearchResults([]);
        setPendingLocation(null);
        setConfirmedLocation(null);
      }
      try {
        const results = await geocodingProvider.search(q, {
          proximity: farmCenter ?? undefined,
          limit: 5,
        });
        if (requestId !== searchRequestRef.current) return;
        if (!results.length) {
          if (!geocodingConfigured) {
            setError(copy.searchNoToken);
          } else {
            setError(copy.searchNoResults);
          }
          setSearchResults([]);
          return;
        }
        setSearchResults(results);
        setPendingLocation(results[0]!);
        bumpViewport(results[0]!);
      } catch {
        if (requestId === searchRequestRef.current) {
          setError(copy.searchFailed);
        }
      } finally {
        if (requestId === searchRequestRef.current) {
          setSearchLoading(false);
        }
      }
    },
    [geocodingProvider, farmCenter, geocodingConfigured, copy, bumpViewport]
  );

  useEffect(() => {
    if (phase !== 'locate' || confirmedLocation) return;
    const q = locationQuery.trim();
    if (q.length < 3) {
      setSearchResults([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void runSearch(q, { debounced: true });
    }, 420);
    return () => window.clearTimeout(handle);
  }, [locationQuery, phase, confirmedLocation, runSearch]);

  useEffect(() => {
    if (phase !== 'locate' || !intakePrefill?.location?.trim() || intakeAutoGeocodeRef.current) {
      return;
    }
    if (!canWrite) return;

    intakeAutoGeocodeRef.current = true;
    const query = intakePrefill.location.trim();
    setLocationQuery(query);
    setSearchLoading(true);
    setError(null);

    void geocodingProvider
      .search(query, { proximity: farmCenter ?? undefined, limit: 5 })
      .then((results) => {
        if (!results.length) {
          setError(copy.autoLocateFailed);
          intakeAutoGeocodeRef.current = false;
          return;
        }
        const first = results[0]!;
        setSearchResults(results);
        setPendingLocation(first);
        setConfirmedLocation(first);
        bumpViewport(first);
      })
      .catch(() => {
        setError(copy.autoLocateError);
        intakeAutoGeocodeRef.current = false;
      })
      .finally(() => setSearchLoading(false));
  }, [
    phase,
    intakePrefill?.location,
    canWrite,
    geocodingProvider,
    farmCenter,
    bumpViewport,
    copy,
  ]);

  const resetLocationState = () => {
    setPendingLocation(null);
    setConfirmedLocation(null);
    setSearchResults([]);
    setLargeAreaAcknowledged(false);
  };

  const handleMapClick = useCallback((point: LatLng) => {
    if (phaseRef.current !== 'draw') return;
    setVertices((prev) => [...prev, point]);
    setLargeAreaAcknowledged(false);
  }, []);

  const beginSetup = () => {
    setError(null);
    setInfoMessage(null);
    setSuccess(null);
    setVertices([]);
    setNewFieldName(defaultFieldNameFromIntake(locale, intakePrefill));
    setFieldType('field');
    setCropName(intakePrefill?.crop ?? '');
    setLocationQuery(farmLocation ?? intakePrefill?.location ?? '');
    resetLocationState();
    setDrawMode('create');
    setSelectedFieldId(null);
    setPhase('locate');
  };

  const beginEditBoundary = useCallback(
    (fieldId: string) => {
      const field = fields.find((f) => f.id === fieldId);
      if (!field) return;
      setError(null);
      setInfoMessage(null);
      setSuccess(null);
      setVertices([]);
      setNewFieldName(field.name);
      setFieldType((field.fieldType as FieldSiteType) ?? 'field');
      setCropName(field.cropName ?? '');
      setPendingLocation(null);
      setConfirmedLocation(null);
      setSearchResults([]);
      setLargeAreaAcknowledged(false);
      setSelectedFieldId(fieldId);
      setDrawMode('edit');
      setPhase('draw');
      if (field.coordinates[0]) {
        bumpViewport({ label: field.name, center: field.coordinates[0] });
      }
    },
    [fields, bumpViewport]
  );

  useEffect(() => {
    if (!initialFieldId || initialFieldAppliedRef.current) return;
    const field =
      fields.find((f) => f.id === initialFieldId) ??
      initialFields.find((f) => f.id === initialFieldId);
    if (!field) return;
    initialFieldAppliedRef.current = true;
    setSelectedFieldId(initialFieldId);

    if (!autoStartDraw || !canWrite) return;

    if (field.coordinates.length >= 3) {
      beginEditBoundary(initialFieldId);
      return;
    }

    setDrawMode('edit');
    setNewFieldName(field.name);
    setCropName(field.cropName ?? intakePrefill?.crop ?? '');
    setLocationQuery(intakePrefill?.location ?? farmLocation ?? '');
    setPhase('locate');
  }, [
    initialFieldId,
    autoStartDraw,
    canWrite,
    fields,
    initialFields,
    intakePrefill,
    farmLocation,
    beginEditBoundary,
  ]);

  const cancelFlow = () => {
    setVertices([]);
    resetLocationState();
    setPhase('idle');
    setDrawMode('create');
  };

  const searchFarmArea = () => {
    const q = farmLocation?.trim();
    if (!q) {
      setError(copy.farmNoLocation);
      return;
    }
    setLocationQuery(q);
    void runSearch(q);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setInfoMessage(copy.geoUnsupported);
      setError(null);
      return;
    }
    setGeoLoading(true);
    setError(null);
    setInfoMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result: GeocodeSearchResult = {
          label: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
          center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        };
        setPendingLocation(result);
        setSearchResults([result]);
        bumpViewport(result);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setInfoMessage(copy.geoDenied);
          setError(null);
        } else {
          setInfoMessage(copy.geoFailed);
          setError(null);
        }
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  };

  const selectSearchResult = (result: GeocodeSearchResult) => {
    setPendingLocation(result);
    bumpViewport(result);
    setConfirmedLocation(null);
    setError(null);
  };

  const confirmLocation = () => {
    if (!pendingLocation) {
      setError(copy.confirmSearchFirst);
      return;
    }
    setConfirmedLocation(pendingLocation);
    setError(null);
    bumpViewport(pendingLocation);
  };

  const resetLocation = () => {
    setConfirmedLocation(null);
    setPendingLocation(null);
    setSearchResults([]);
    setLargeAreaAcknowledged(false);
  };

  const proceedToDraw = () => {
    if (!confirmedLocation) {
      setError(copy.confirmBeforeDraw);
      return;
    }
    setError(null);
    setVertices([]);
    setLargeAreaAcknowledged(false);
    setPhase('draw');
    bumpViewport(confirmedLocation);
  };

  const undoVertex = () => {
    setVertices((prev) => prev.slice(0, -1));
    setLargeAreaAcknowledged(false);
  };

  const clearVertices = () => {
    setVertices([]);
    setLargeAreaAcknowledged(false);
  };

  const finishBoundary = () => {
    if (vertices.length < 3) {
      setError(copy.minVertices);
      return;
    }
    const boundary = positionsToBoundaryGeoJson(vertices);
    if (!boundary) {
      setError(FRIENDLY_BOUNDARY_SAVE_ERROR);
      return;
    }
    setError(null);
    if (drawMode === 'create') {
      setPhase('confirm');
    }
  };

  const finishIntakeHandoff = async (fieldId: string): Promise<void> => {
    let caseId: string | null = null;
    let intakeQuestion: string | null = intakePrefill?.symptom ?? null;
    try {
      const intakeRaw = sessionStorage.getItem(INTAKE_STORAGE_KEY);
      if (intakeRaw) {
        const intake = JSON.parse(intakeRaw) as FarmIntakeParseResult;
        intakeQuestion = intake.rawText ?? intakeQuestion;
        const caseRes = await fetch('/api/field-cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intake, farmId, fieldId }),
        });
        const caseJson = await caseRes.json();
        if (caseRes.ok) caseId = caseJson.fieldCase?.id ?? null;
        sessionStorage.removeItem(INTAKE_STORAGE_KEY);
      }
    } catch {
      // field case is optional — field save succeeded
    }

    const params = new URLSearchParams();
    params.set('fieldId', fieldId);
    params.set('saved', '1');
    if (caseId) params.set('caseId', caseId);
    if (intakeQuestion) params.set('q', intakeQuestion);
    router.push(`/doctor?${params.toString()}`);
  };

  const saveNewField = async () => {
    const name = newFieldName.trim() || defaultFieldNameFromIntake(locale, intakePrefill);
    if (!name) {
      setError(copy.fieldNameRequired);
      return;
    }
    if (!confirmedLocation) {
      setError(copy.locateFirst);
      return;
    }
    if (vertices.length < 3) {
      setError(copy.minVertices);
      return;
    }
    if (isLargeArea && !largeAreaAcknowledged) {
      setError(copy.largeAreaConfirm);
      return;
    }
    const boundary = positionsToBoundaryGeoJson(vertices);
    if (!boundary) {
      setError(FRIENDLY_BOUNDARY_SAVE_ERROR);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          name,
          fieldType,
          cropName: cropName.trim() || undefined,
          boundaryGeojson: boundary,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error ?? FRIENDLY_BOUNDARY_SAVE_ERROR;
        throw new Error(msg);
      }
      const saved = apiFieldToMapData(json.field, {
        coordinates: json.field.coordinates?.length ? json.field.coordinates : vertices,
        fieldType,
        cropName: cropName.trim() || null,
      });
      setFields((prev) => [...prev, saved]);
      setSelectedFieldId(saved.id);
      try {
        localStorage.setItem(DOCTOR_FIELD_STORAGE_KEY, saved.id);
      } catch {
        // optional
      }

      setSuccess(copy.savedOpeningDoctor);
      window.setTimeout(() => {
        void finishIntakeHandoff(saved.id);
      }, 700);
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : FRIENDLY_BOUNDARY_SAVE_ERROR;
      setError(
        msg.includes('GeoJSON') || msg.includes('Polygon') ? FRIENDLY_BOUNDARY_SAVE_ERROR : msg
      );
    } finally {
      setSaving(false);
    }
  };

  const updateExistingBoundary = async () => {
    if (!selectedFieldId || vertices.length < 3) return;
    if (isLargeArea && !largeAreaAcknowledged) {
      setError(copy.largeAreaUnusual);
      return;
    }
    const boundary = positionsToBoundaryGeoJson(vertices);
    if (!boundary) {
      setError(FRIENDLY_BOUNDARY_SAVE_ERROR);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/fields/${selectedFieldId}/boundary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boundaryGeojson: boundary }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? FRIENDLY_BOUNDARY_SAVE_ERROR);
      setFields((prev) =>
        prev.map((f) =>
          f.id === selectedFieldId
            ? apiFieldToMapData(json.field, {
                coordinates: json.field.coordinates?.length
                  ? json.field.coordinates
                  : vertices,
                fieldType: f.fieldType,
                cropName: f.cropName,
              })
            : f
        )
      );
      setSuccess(copy.boundaryUpdated);
      const hasIntakeHandoff =
        intakePrefill != null ||
        (typeof sessionStorage !== 'undefined' &&
          sessionStorage.getItem(INTAKE_STORAGE_KEY) != null);
      if (hasIntakeHandoff) {
        setSuccess(copy.savedOpeningDoctor);
        window.setTimeout(() => {
          void finishIntakeHandoff(selectedFieldId);
        }, 700);
        return;
      }
      cancelFlow();
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.updateFailed);
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const isDrawing = phase === 'draw';
  const showFlowPanel = phase !== 'idle';
  const simpleStep = getSimpleStep(phase);
  const statedAreaLabel =
    intakePrefill?.statedArea != null
      ? `${intakePrefill.statedArea} ${intakePrefill.areaUnit ?? 'donum'}`
      : null;

  const panelTitle =
    phase === 'idle'
      ? copy.panelTitles.idle
      : drawMode === 'edit'
        ? copy.editBoundary
        : phase === 'locate'
          ? copy.panelTitles.locate
          : phase === 'draw'
            ? copy.panelTitles.draw
            : phase === 'confirm'
              ? copy.panelTitles.confirm
              : copy.panelTitles.default;

  const stepHint =
    phase === 'locate'
      ? copy.stepHints.locate
      : phase === 'draw'
        ? copy.stepHints.draw
        : phase === 'confirm'
          ? copy.stepHints.confirm
          : copy.whereAmI;

  const mapLabels = {
    loading: copy.mapLoading,
    loadFailed: copy.mapLoadFailed,
    tokenHint: copy.mapTokenHint,
    layerHint: copy.layersHint,
    zoomIn: copy.zoomIn,
    zoomOut: copy.zoomOut,
    myLocation: copy.myLocation,
    ariaMap: copy.mapAria,
    geoUnsupported: copy.geoUnsupported,
    geoDenied: copy.geoDenied,
    geoFailed: copy.geoFailed,
  };

  return (
    <div className="flex min-h-0 flex-col gap-3 lg:h-[calc(100dvh-10.5rem)] lg:flex-row lg:gap-4">
      <div className="relative min-h-[min(50dvh,400px)] shrink-0 lg:min-h-0 lg:flex-[73]">
        {(isDrawing || phase === 'confirm') && draftMetrics && areaTriple && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-20 max-w-[220px] sm:max-w-[240px]">
            <div className="pointer-events-auto rounded-lg border border-border/60 bg-background/95 p-2.5 shadow-md backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {copy.areaLabel}
              </p>
              <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground sm:text-lg">
                {areaTriple.m2.toLocaleString()} m²
              </p>
              <p className="text-xs text-muted-foreground">
                {areaTriple.donum} dönüm · {areaTriple.hectare} ha
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {vertices.length} {copy.corners}
              </p>
              {showAreaMismatch && (
                <p className="mt-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  {copy.areaMismatch(statedAreaLabel ?? '—')}
                </p>
              )}
            </div>
          </div>
        )}

        <MapView
          provider={mapProvider}
          className="h-full min-h-[280px]"
          center={mapCenter}
          zoom={mapZoom}
          viewTarget={viewTarget}
          polygons={polygons}
          polylines={polylines}
          points={isDrawing || phase === 'confirm' ? vertices : undefined}
          drawingMode={isDrawing}
          hideLayerHint
          labels={mapLabels}
          geoErrorVariant="info"
          emptyMessage={copy.mapUnconfigured}
          errorMessage={copy.mapLoadFailed}
          onMapClick={handleMapClick}
        />
      </div>

      <aside className="flex min-h-0 w-full flex-col lg:flex-[27] lg:max-w-[400px] lg:overflow-hidden max-lg:rounded-t-xl max-lg:border max-lg:border-border max-lg:bg-card max-lg:shadow-lg max-lg:-mt-1">
        <div className="flex max-h-[min(52dvh,520px)] min-h-0 flex-1 flex-col overflow-hidden lg:max-h-none">
          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5 lg:max-h-full">
            {!mapConfigured && (
              <p className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {copy.mapUnconfigured}
              </p>
            )}
            <Card>
              <CardHeader className="space-y-1 pb-2 pt-4">
                <CardTitle className="text-base">{farmName}</CardTitle>
                {farmLocation && (
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {farmLocation}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{copy.fieldsOnMap(fields.length)}</p>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {fields.length === 0 && phase === 'idle' && (
                  <p className="rounded-md border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
                    {copy.noFieldsYet}
                  </p>
                )}
                {fields.length > 0 && (
                  <ul className="grid gap-2">
                    {fields.map((f) => {
                      const isSelected = selectedFieldId === f.id;
                      const areaText = formatFieldArea(f);
                      return (
                        <li key={f.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedFieldId(f.id)}
                            className={`w-full rounded-lg border p-3 text-left transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/25'
                                : 'border-border hover:border-primary/40 hover:bg-muted/40'
                            }`}
                          >
                            <p className="font-medium leading-tight text-foreground">{f.name}</p>
                            <dl className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                              <div>
                                <dt className="inline">{copy.fieldCard.crop}: </dt>
                                <dd className="inline font-medium text-foreground/80">
                                  {f.cropName ?? '—'}
                                </dd>
                              </div>
                              <div>
                                <dt className="inline">{copy.fieldCard.area}: </dt>
                                <dd className="inline font-medium text-foreground/80">
                                  {areaText ?? copy.fieldCard.noBoundary}
                                </dd>
                              </div>
                            </dl>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {selectedField && phase === 'idle' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {canWrite && selectedField.coordinates.length >= 3 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => beginEditBoundary(selectedField.id)}
                      >
                        {copy.fieldCard.redraw}
                      </Button>
                    )}
                    <Link
                      href={`/fields/${selectedField.id}`}
                      className="inline-flex items-center text-xs text-primary hover:underline"
                    >
                      {copy.fieldCard.details}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {canWrite && (
              <Card>
                <CardHeader className="space-y-2 pb-2 pt-4">
                  {showFlowPanel && drawMode === 'create' && (
                    <CompactStepBar step={simpleStep} steps={copy.steps} ariaLabel={copy.progressAria} />
                  )}
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PenLine className="h-4 w-4 shrink-0" aria-hidden />
                    {panelTitle}
                  </CardTitle>
                  {showFlowPanel && (
                    <p className="text-xs text-muted-foreground">{stepHint}</p>
                  )}
                  {phase === 'confirm' && drawMode === 'create' && (
                    <p className="text-[11px] text-muted-foreground">{copy.nextAfterSave}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  {phase === 'idle' && (
                    <Button type="button" className="w-full" onClick={beginSetup}>
                      {fields.length ? copy.addNewField : copy.addFirstField}
                    </Button>
                  )}

                  {phase === 'locate' && (
                    <>
                      {searchLoading && intakePrefill?.location && (
                        <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                          {copy.search.searching}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label htmlFor="location-search">{copy.search.label}</Label>
                        <div className="relative">
                          <Input
                            id="location-search"
                            value={locationQuery}
                            onChange={(e) => {
                              setLocationQuery(e.target.value);
                              setInfoMessage(null);
                            }}
                            placeholder={copy.search.placeholder}
                            className="pr-9 text-base"
                            autoComplete="off"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void runSearch(locationQuery);
                            }}
                          />
                          {searchLoading && (
                            <Loader2
                              className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
                              aria-hidden
                            />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          {farmLocation && (
                            <button
                              type="button"
                              className="text-primary hover:underline"
                              onClick={searchFarmArea}
                            >
                              {copy.search.useFarmArea}
                            </button>
                          )}
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                            onClick={useCurrentLocation}
                            disabled={geoLoading}
                          >
                            {geoLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                            ) : (
                              <LocateFixed className="h-3 w-3" aria-hidden />
                            )}
                            {copy.search.useMyLocation}
                          </button>
                        </div>
                      </div>

                      {infoMessage && (
                        <div className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                          {infoMessage}
                        </div>
                      )}

                      {searchResults.length > 0 && !confirmedLocation && (
                        <ul
                          className="max-h-36 space-y-0.5 overflow-y-auto rounded-md border p-1"
                          role="listbox"
                          aria-label={copy.search.label}
                        >
                          {searchResults.map((r) => {
                            const isPending =
                              pendingLocation?.label === r.label &&
                              pendingLocation.center.lat === r.center.lat;
                            return (
                              <li key={`${r.label}-${r.center.lat}-${r.center.lng}`}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={isPending}
                                  onClick={() => selectSearchResult(r)}
                                  className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                                    isPending
                                      ? 'bg-primary/10 text-primary'
                                      : 'hover:bg-muted'
                                  }`}
                                >
                                  {r.label}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {pendingLocation && !confirmedLocation && (
                        <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm">
                          <p className="font-medium">{copy.search.confirmPrompt}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{pendingLocation.label}</p>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            <Button type="button" size="sm" onClick={confirmLocation}>
                              <Check className="h-3.5 w-3.5" />
                              {copy.search.confirmBtn}
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={resetLocation}>
                              <RotateCcw className="h-3.5 w-3.5" />
                              {copy.search.resetBtn}
                            </Button>
                          </div>
                        </div>
                      )}

                      {confirmedLocation && (
                        <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                          <p className="font-medium text-primary">{copy.search.confirmed}</p>
                          <p className="mt-1 text-muted-foreground">{confirmedLocation.label}</p>
                          <button
                            type="button"
                            className="mt-2 text-primary hover:underline"
                            onClick={resetLocation}
                          >
                            {copy.search.changeLocation}
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button type="button" variant="outline" className="flex-1" onClick={cancelFlow}>
                          {copy.search.cancel}
                        </Button>
                        <Button
                          type="button"
                          className="flex-1"
                          disabled={!confirmedLocation}
                          onClick={proceedToDraw}
                        >
                          {copy.search.proceedDraw}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}

                  {phase === 'draw' && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {drawMode === 'edit'
                          ? copy.draw.editHint(newFieldName)
                          : copy.draw.createHint}
                      </p>
                      {isLargeArea && (
                        <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-xs dark:border-amber-900/50 dark:bg-amber-950/30">
                          <p className="font-medium text-amber-900 dark:text-amber-200">
                            {copy.draw.largeArea}
                          </p>
                          <label className="mt-2 flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={largeAreaAcknowledged}
                              onChange={(e) => setLargeAreaAcknowledged(e.target.checked)}
                            />
                            {copy.draw.largeConfirm(draftMetrics?.areaHectares ?? 0)}
                          </label>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={undoVertex}
                          disabled={!vertices.length}
                        >
                          <Undo2 className="mr-1 h-3.5 w-3.5" />
                          {copy.draw.undo}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={clearVertices}
                          disabled={!vertices.length}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          {copy.draw.clear}
                        </Button>
                        {drawMode === 'create' ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={finishBoundary}
                            disabled={vertices.length < 3}
                          >
                            {copy.draw.finish}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              vertices.length < 3 ||
                              saving ||
                              (isLargeArea && !largeAreaAcknowledged)
                            }
                            onClick={updateExistingBoundary}
                          >
                            {saving ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="mr-1 h-3.5 w-3.5" />
                            )}
                            {copy.draw.save}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => (drawMode === 'edit' ? cancelFlow() : setPhase('locate'))}
                        >
                          {copy.draw.back}
                        </Button>
                      </div>
                    </>
                  )}

                  {phase === 'confirm' && drawMode === 'create' && (
                    <>
                      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                        <p className="font-semibold text-foreground">{copy.confirm.title}</p>
                        <dl className="mt-2.5 space-y-1.5 text-xs">
                          <div className="flex justify-between gap-2">
                            <dt className="text-muted-foreground">{copy.confirm.fieldName}</dt>
                            <dd className="font-medium">
                              {newFieldName || defaultFieldNameFromIntake(locale, intakePrefill)}
                            </dd>
                          </div>
                          {cropName && (
                            <div className="flex justify-between gap-2">
                              <dt className="text-muted-foreground">{copy.confirm.crop}</dt>
                              <dd className="font-medium">{cropName}</dd>
                            </div>
                          )}
                          {confirmedLocation && (
                            <div className="flex justify-between gap-2">
                              <dt className="text-muted-foreground">{copy.confirm.location}</dt>
                              <dd className="max-w-[180px] truncate text-right font-medium">
                                {confirmedLocation.label.split(',')[0]}
                              </dd>
                            </div>
                          )}
                          {areaTriple && (
                            <>
                              <div className="flex justify-between gap-2">
                                <dt className="text-muted-foreground">{copy.confirm.area}</dt>
                                <dd className="font-medium tabular-nums">
                                  {areaTriple.m2.toLocaleString()} m²
                                </dd>
                              </div>
                              <div className="flex justify-between gap-2">
                                <dt className="text-muted-foreground">&nbsp;</dt>
                                <dd className="text-muted-foreground">
                                  {areaTriple.donum} dönüm · {areaTriple.hectare} ha
                                </dd>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between gap-2">
                            <dt className="text-muted-foreground">{copy.confirm.corners}</dt>
                            <dd className="font-medium">{vertices.length}</dd>
                          </div>
                        </dl>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-field-name">{copy.confirm.nameLabel}</Label>
                        <Input
                          id="confirm-field-name"
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          placeholder={copy.confirm.namePlaceholder}
                        />
                      </div>
                      {!cropName && (
                        <div className="space-y-2">
                          <Label htmlFor="confirm-crop">{copy.confirm.cropOptional}</Label>
                          <Input
                            id="confirm-crop"
                            list="crop-suggestions"
                            value={cropName}
                            onChange={(e) => setCropName(e.target.value)}
                            placeholder={copy.confirm.cropPlaceholder}
                          />
                          <datalist id="crop-suggestions">
                            {CROP_OPTIONS.map((c) => (
                              <option key={c.id} value={c.label} />
                            ))}
                          </datalist>
                        </div>
                      )}
                      {isLargeArea && !largeAreaAcknowledged && (
                        <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs dark:border-amber-900/50 dark:bg-amber-950/30">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={largeAreaAcknowledged}
                              onChange={(e) => setLargeAreaAcknowledged(e.target.checked)}
                            />
                            {copy.confirm.largeAck}
                          </label>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          className="w-full"
                          disabled={saving || (isLargeArea && !largeAreaAcknowledged)}
                          onClick={saveNewField}
                        >
                          {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          {copy.confirm.saveAndDoctor}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setPhase('draw')}
                        >
                          {copy.confirm.edit}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <p className="rounded-lg border border-dashed px-3 py-2 text-[11px] text-muted-foreground">
              {copy.layersCard}
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="animate-success-pulse border-primary/30 bg-primary/5">
                <AlertDescription className="text-sm font-medium text-primary">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
