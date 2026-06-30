import type { AreaUnit } from '@nertura/types';

import type { FarmAreaUnitInput } from './types';

/** 1 Turkish dönüm ≈ 1000 m² ≈ 0.1 hectare */
const DONUM_TO_HECTARE = 0.1;
const ACRE_TO_HECTARE = 0.404686;

/** Convert user-entered area to DB storage (hectares + enum unit). */
export function normalizeFarmArea(
  value: number | null | undefined,
  unit: FarmAreaUnitInput
): { total_area: number | null; area_unit: AreaUnit; display_unit: FarmAreaUnitInput; display_area: number | null } {
  if (value == null || Number.isNaN(value) || value <= 0) {
    return { total_area: null, area_unit: 'hectare', display_unit: unit, display_area: null };
  }

  if (unit === 'donum') {
    return {
      total_area: Math.round(value * DONUM_TO_HECTARE * 10000) / 10000,
      area_unit: 'hectare',
      display_unit: 'donum',
      display_area: value,
    };
  }

  if (unit === 'acre') {
    return {
      total_area: Math.round(value * ACRE_TO_HECTARE * 10000) / 10000,
      area_unit: 'hectare',
      display_unit: 'acre',
      display_area: value,
    };
  }

  return {
    total_area: value,
    area_unit: 'hectare',
    display_unit: 'hectare',
    display_area: value,
  };
}

export function formatFarmArea(
  totalArea: number | null | undefined,
  areaUnit: AreaUnit | string | null | undefined,
  metadata?: Record<string, unknown> | null
): string | null {
  if (totalArea == null) return null;
  const meta = metadata ?? {};
  const displayUnit = (meta.display_area_unit as FarmAreaUnitInput | undefined) ?? areaUnit;
  const displayArea =
    meta.display_area != null ? Number(meta.display_area) : Number(totalArea);

  if (displayUnit === 'donum') {
    const donum =
      meta.display_area != null
        ? displayArea
        : Math.round((Number(totalArea) / DONUM_TO_HECTARE) * 100) / 100;
    return `${donum} dönüm`;
  }
  if (displayUnit === 'acre' || areaUnit === 'acre') {
    return `${displayArea} acre${displayArea === 1 ? '' : 's'}`;
  }
  return `${displayArea} ha`;
}
