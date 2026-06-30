'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

import { Label } from '@nertura/ui';

import { getDashboardCopy, type DashboardLocale } from '@/lib/i18n/dashboard-copy';

const STORAGE_KEY = 'nertura_selected_field_id';

export interface FieldOption {
  id: string;
  name: string;
  farmName?: string | null;
  areaHectares?: number | null;
  crops?: string[];
}

interface FieldContextSelectorProps {
  fields: FieldOption[];
  value?: string | null;
  onChange?: (fieldId: string | null) => void;
  locale?: DashboardLocale;
}

function formatFieldLabel(f: FieldOption): string {
  const parts = [f.name];
  if (f.farmName) parts.push(f.farmName);
  const meta: string[] = [];
  if (f.areaHectares != null) meta.push(`${f.areaHectares} ha`);
  if (f.crops?.length) meta.push(f.crops.join(', '));
  if (meta.length) parts.push(meta.join(' · '));
  return parts.join(' — ');
}

export function FieldContextSelector({
  fields,
  value,
  onChange,
  locale = 'tr',
}: FieldContextSelectorProps) {
  const doctorCopy = getDashboardCopy(locale).doctor;
  const [selected, setSelected] = useState<string>(value ?? '');

  useEffect(() => {
    if (value !== undefined) {
      setSelected(value ?? '');
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && fields.some((f) => f.id === saved)) {
      setSelected(saved);
      onChange?.(saved);
    }
  }, [value, fields, onChange]);

  const handleChange = (next: string) => {
    setSelected(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, next);
      onChange?.(next);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      onChange?.(null);
    }
  };

  if (!fields.length) return null;

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
      <Label htmlFor="doctor-field-context" className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        {doctorCopy.fieldContext}
      </Label>
      <select
        id="doctor-field-context"
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm sm:max-w-md"
      >
        <option value="">{doctorCopy.allFarm}</option>
        {fields.map((f) => (
          <option key={f.id} value={f.id}>
            {formatFieldLabel(f)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function getStoredFieldId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredFieldId(fieldId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, fieldId);
}
