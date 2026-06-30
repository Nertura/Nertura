import { NextResponse } from 'next/server';
import { z } from 'zod';

import { dashboardContextFromRequest } from '@nertura/utils';

import { getAuthCallbackUrl } from '@/lib/auth/constants';
import { checkEmailOtpLimits } from '@/lib/auth/otp-rate-limit';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  email: z.string().email(),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const body = bodySchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();

    const rate = checkEmailOtpLimits(email, ip);
    if (!rate.ok) {
      return NextResponse.json(
        { error: rate.reason },
        {
          status: 429,
          headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : {},
        }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(body.next ?? '/', dashboardContextFromRequest(request)),
        shouldCreateUser: true,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OTP request failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
