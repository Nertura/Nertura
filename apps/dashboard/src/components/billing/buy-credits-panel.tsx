'use client';

import { useState } from 'react';

import { Button } from '@nertura/ui';

import { OPS_COPY } from '@/lib/i18n/ops-copy';
import { CREDIT_PACKAGES, type CreditPackageSlug } from '@/lib/stripe/config';

interface BuyCreditsProps {
  stripeEnabled: boolean;
}

export function BuyCreditsPanel({ stripeEnabled }: BuyCreditsProps) {
  const copy = OPS_COPY.billing;
  const [loading, setLoading] = useState<CreditPackageSlug | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(slug: CreditPackageSlug) {
    setError(null);
    setLoading(slug);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: slug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? copy.checkoutFailed);
      if (json.url) window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.checkoutFailed);
    } finally {
      setLoading(null);
    }
  }

  if (!stripeEnabled) {
    return <p className="text-sm text-muted-foreground">{copy.stripeNotConfigured}</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(CREDIT_PACKAGES) as CreditPackageSlug[]).map((slug) => {
          const pkg = CREDIT_PACKAGES[slug];
          return (
            <div key={slug} className="rounded-lg border bg-card p-4 text-center">
              <p className="font-semibold text-void">{pkg.name}</p>
              <p className="mt-1 text-2xl font-bold text-void">{pkg.credits}</p>
              <p className="text-xs text-muted-foreground">{copy.creditsLabel}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                ${(pkg.priceCents / 100).toFixed(2)}
              </p>
              <Button
                className="mt-4 w-full"
                size="sm"
                disabled={loading !== null}
                onClick={() => checkout(slug)}
              >
                {loading === slug ? copy.redirecting : copy.buy}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
