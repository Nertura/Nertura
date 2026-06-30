import { NextResponse } from 'next/server';

import { isResendConfigured } from '@/lib/outreach/resend';

export async function GET() {
  const apiKeySet = Boolean(process.env.RESEND_API_KEY);
  const fromEmailSet = Boolean(process.env.OUTREACH_FROM_EMAIL);
  const notifyEmailSet = Boolean(process.env.OUTREACH_NOTIFY_EMAIL);
  const configured = isResendConfigured();

  return NextResponse.json({
    configured,
    apiKeySet,
    fromEmailSet,
    notifyEmailSet,
    canSendTest: configured,
    message: configured
      ? 'Resend is configured. Test sends require founder approval on each draft.'
      : 'Configure RESEND_API_KEY and OUTREACH_FROM_EMAIL in admin .env.local to enable sends.',
  });
}
