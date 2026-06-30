'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Label,
  buttonVariants,
  cn,
} from '@nertura/ui';

import { getBrowserDashboardContext } from '@nertura/utils';

import { AUTH_ROUTES, getAuthCallbackUrl } from '@/lib/auth/constants';
import { AUTH_COPY } from '@/lib/i18n/auth-copy';
import { createClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
  const copy = AUTH_COPY.forgotPassword;
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthCallbackUrl('/reset-password', getBrowserDashboardContext()),
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Alert variant="success">
          <AlertTitle>{copy.successTitle}</AlertTitle>
          <AlertDescription>{copy.successBody(email)}</AlertDescription>
        </Alert>
        <Link
          href={AUTH_ROUTES.login}
          className={cn(buttonVariants({ variant: 'outline' }), 'h-11 w-full rounded-xl')}
        >
          {copy.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{copy.errorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{copy.email}</Label>
        <Input
          id="email"
          type="email"
          placeholder={copy.emailPlaceholder}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl"
        />
      </div>

      <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
        {loading ? copy.submitting : copy.submit}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={AUTH_ROUTES.login} className="font-medium text-primary hover:underline">
          {copy.backToLogin}
        </Link>
      </p>
    </form>
  );
}
