'use client';

import type { ReactNode } from 'react';

import { cn } from '@nertura/ui';

import { getOnboardingCopy } from '@/lib/i18n/onboarding-copy';
import type { OnboardingStepId } from '@/lib/onboarding/types';

interface OnboardingLayoutProps {
  currentStep: OnboardingStepId;
  children: ReactNode;
  locale?: 'tr' | 'en';
}

export function OnboardingLayout({
  currentStep,
  children,
  locale = 'tr',
}: OnboardingLayoutProps) {
  const copy = getOnboardingCopy(locale);
  const steps = copy.steps;
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal text-sm font-bold text-void">
              N
            </span>
            <div>
              <p className="text-sm font-semibold text-void">Nertura</p>
              <p className="text-[10px] text-muted-foreground">{copy.layout.subtitle}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {copy.layout.stepOf(currentIndex + 1, steps.length)}
          </p>
        </div>
      </header>

      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {steps.map((step, i) => {
              const done = i < currentIndex;
              const active = step.id === currentStep;
              return (
                <div key={step.id} className="flex min-w-0 flex-1 items-center gap-1">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                      done && 'bg-signal text-void',
                      active && 'bg-void text-signal ring-2 ring-signal/30',
                      !done && !active && 'bg-muted text-muted-foreground'
                    )}
                    aria-current={active ? 'step' : undefined}
                  >
                    {done ? '✓' : i + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden truncate text-xs sm:inline',
                      active ? 'font-medium text-void' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div
                      className={cn('mx-1 h-px min-w-[12px] flex-1', done ? 'bg-signal' : 'bg-border')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
