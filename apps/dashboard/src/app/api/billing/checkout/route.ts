import { NextResponse } from 'next/server';
import { z } from 'zod';

import { dashboardContextFromRequest, getDashboardBaseUrl } from '@nertura/utils';

import { getDashboardContext } from '@/lib/auth/context';
import {
  CREDIT_PACKAGES,
  getStripe,
  isStripeConfigured,
  type CreditPackageSlug,
} from '@/lib/stripe/config';

const bodySchema = z.object({
  package: z.enum(['starter', 'pro', 'business']),
});

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payments are not configured. Set STRIPE_SECRET_KEY.' },
        { status: 503 }
      );
    }

    const ctx = await getDashboardContext();
    const body = bodySchema.parse(await request.json());
    const pkg = CREDIT_PACKAGES[body.package as CreditPackageSlug];
    const stripe = getStripe()!;

    const appUrl = getDashboardBaseUrl(dashboardContextFromRequest(request));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: ctx.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: pkg.priceCents,
            product_data: {
              name: `Nertura ${pkg.name}`,
              description: pkg.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: ctx.userId,
        package_slug: pkg.slug,
        credits: String(pkg.credits),
      },
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/account?canceled=1`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
