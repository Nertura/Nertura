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

import { AUTH_ROUTES, MIN_PASSWORD_LENGTH } from '@/lib/auth/constants';
import { AUTH_COPY } from '@/lib/i18n/auth-copy';
import { createClient } from '@/lib/supabase/client';

export function ResetPasswordForm() {
  const copy = AUTH_COPY.resetPassword;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(copy.passwordTooShort(MIN_PASSWORD_LENGTH));
      return;
    }

    if (password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Alert variant="success">
          <AlertTitle>{copy.successTitle}</AlertTitle>
          <AlertDescription>{copy.successBody}</AlertDescription>
        </Alert>
        <Link href={AUTH_ROUTES.login} className={cn(buttonVariants(), 'h-11 w-full rounded-xl')}>
          {copy.continueLogin}
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
        <Label htmlFor="password">{copy.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{copy.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-11 rounded-xl"
        />
      </div>

      <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
        {loading ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
