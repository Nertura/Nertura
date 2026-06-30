import { NextResponse } from 'next/server';
import { z } from 'zod';

import { checkOtpRateLimit } from '@/lib/auth/otp-rate-limit';
import {
  isSmsAuthEnabled,
  isSmsCaptchaRequired,
  verifySmsCaptcha,
} from '@/lib/auth/sms-config';

const bodySchema = z.object({
  phone: z.string().min(8).max(20),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isSmsAuthEnabled()) {
    return NextResponse.json(
      {
        error: 'SMS login is not enabled yet. Phone sign-in is coming soon.',
        enabled: false,
      },
      { status: 503 }
    );
  }

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const body = bodySchema.parse(await request.json());

    const ipRate = checkOtpRateLimit(`sms:ip:${ip}`, 10);
    if (!ipRate.ok) {
      return NextResponse.json(
        { error: 'Too many SMS requests. Please wait and try again.' },
        { status: 429 }
      );
    }

    if (isSmsCaptchaRequired()) {
      const captchaOk = await verifySmsCaptcha(body.captchaToken);
      if (!captchaOk) {
        return NextResponse.json(
          { error: 'CAPTCHA verification required for SMS login.' },
          { status: 400 }
        );
      }
    }

    // Scaffold: wire Supabase phone OTP when SMS provider + CAPTCHA are configured.
    return NextResponse.json(
      {
        error: 'SMS provider integration pending.',
        enabled: true,
      },
      { status: 501 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SMS request failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
