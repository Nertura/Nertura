import { Suspense } from 'react';

import { AuthShell } from '@/components/auth/auth-shell';
import { PhoneAuthForm } from '@/components/auth/phone-auth-form';
import { AUTH_COPY } from '@/lib/i18n/auth-copy';

export default function PhoneLoginPage() {
  const copy = AUTH_COPY.phoneLogin;

  return (
    <AuthShell title={copy.title} description={copy.description}>
      <Suspense fallback={<div className="text-sm text-muted-foreground">{AUTH_COPY.loading}</div>}>
        <PhoneAuthForm />
      </Suspense>
    </AuthShell>
  );
}
