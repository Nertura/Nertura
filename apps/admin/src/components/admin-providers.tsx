'use client';

import { ThemeProvider } from '@nertura/ui';
import type { ReactNode } from 'react';

export function AdminProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
