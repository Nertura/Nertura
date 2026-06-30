import { Suspense } from 'react';

import { AuthShell } from '@/components/auth/auth-shell';
import { AuthProviderButtons } from '@/components/auth/auth-provider-buttons';
import { LoginForm } from '@/components/auth/login-form';
import { AUTH_COPY } from '@/lib/i18n/auth-copy';
import { getOAuthProviderStatus } from '@/lib/auth/oauth-providers';

export default async function LoginPage() {
  const oauthProviders = await getOAuthProviderStatus();
  const copy = AUTH_COPY.login;

  return (
    <AuthShell title={copy.title} description={copy.description}>
      <Suspense fallback={<div className="text-sm text-muted-foreground">{AUTH_COPY.loading}</div>}>
        <div className="space-y-6">
          <AuthProviderButtons mode="login" initialProviders={oauthProviders} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">{copy.emailDivider}</span>
            </div>
          </div>

          <LoginForm />
        </div>
      </Suspense>
    </AuthShell>
  );
}
