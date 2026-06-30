import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/config';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  const body = await request.text();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('[stripe webhook] signature error', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits ?? '0', 10);
    const packageSlug = session.metadata?.package_slug ?? 'unknown';

    if (!userId || credits <= 0) {
      console.error('[stripe webhook] missing metadata', session.id);
      return NextResponse.json({ received: true, skipped: true });
    }

    try {
      const admin = createAdminClient();
      const { data, error } = await admin.rpc('grant_user_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_transaction_type: 'purchase',
        p_description: `Stripe purchase — ${packageSlug} (${credits} credits)`,
        p_reference_id: session.payment_intent as string | null,
        p_stripe_session_id: session.id,
        p_metadata: { package_slug: packageSlug, stripe_event: event.id },
      });

      if (error) {
        console.error('[stripe webhook] grant failed', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const result = data as { duplicate?: boolean };
      if (result?.duplicate) {
        console.info('[stripe webhook] duplicate session', session.id);
      } else {
        console.info('[stripe webhook] credits granted', { userId, credits, session: session.id });
      }
    } catch (err) {
      console.error('[stripe webhook] processing error', err);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
