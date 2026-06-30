'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import { UpgradeModal } from '@/components/billing/upgrade-modal';

interface UpgradeModalContextValue {
  openUpgrade: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextValue | null>(null);

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <UpgradeModalContext.Provider value={{ openUpgrade: () => setOpen(true) }}>
      {children}
      <UpgradeModal open={open} onClose={() => setOpen(false)} />
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal(): UpgradeModalContextValue {
  const ctx = useContext(UpgradeModalContext);
  if (!ctx) {
    throw new Error('useUpgradeModal must be used within UpgradeModalProvider');
  }
  return ctx;
}
