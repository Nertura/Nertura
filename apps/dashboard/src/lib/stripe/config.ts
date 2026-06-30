import Stripe from 'stripe';

export const CREDIT_PACKAGES = {
  starter: {
    slug: 'starter',
    name: 'Starter',
    credits: 100,
    priceCents: 999,
    description: '100 AI agriculture credits',
  },
  pro: {
    slug: 'pro',
    name: 'Pro',
    credits: 500,
    priceCents: 2999,
    description: '500 AI agriculture credits',
  },
  business: {
    slug: 'business',
    name: 'Business',
    credits: 2000,
    priceCents: 9999,
    description: '2000 AI agriculture credits',
  },
} as const;

export type CreditPackageSlug = keyof typeof CREDIT_PACKAGES;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? null;
}
