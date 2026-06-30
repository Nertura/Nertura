'use client';

import { useEffect, useState } from 'react';

const DEFAULT_INTERVAL_MS = 4500;

/** Client-only placeholder rotation — first item matches SSR to avoid hydration mismatch. */
export function useRotatingPlaceholder(
  placeholders: readonly string[],
  intervalMs = DEFAULT_INTERVAL_MS
): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (placeholders.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % placeholders.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [placeholders, intervalMs]);

  return placeholders[index] ?? placeholders[0] ?? '';
}
