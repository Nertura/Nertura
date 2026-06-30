import { Suspense } from 'react';

import { AuthShell } from '@/components/auth/auth-shell';
import { EmailOtpForm } from '@/components/auth/email-otp-form';

export default function MagicLinkPage() {
  return (
    <AuthShell
      title="Continue with email"
      description="We'll send a magic link and one-time code to your inbox."
    >
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <EmailOtpForm />
      </Suspense>
    </AuthShell>
  );
}
