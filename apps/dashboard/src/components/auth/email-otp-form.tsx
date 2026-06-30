'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Label,
} from '@nertura/ui';

import { AUTH_ROUTES } from '@/lib/auth/constants';
import { createClient } from '@/lib/supabase/client';
import { sanitizeInternalPath } from '@nertura/utils';

type Step = 'email' | 'sent';

export function EmailOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = sanitizeInternalPath(searchParams.get('next'), '/doctor');

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to send code');

      setStep('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (step === 'sent') {
    return (
      <div className="space-y-6">
        <Alert variant="success">
          <AlertTitle>Check your email</AlertTitle>
          <AlertDescription>
            We sent a magic link and 6-digit code to <strong>{email}</strong>.
          </AlertDescription>
        </Alert>

        <form onSubmit={verifyOtp} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
            {loading ? 'Verifying…' : 'Verify and continue'}
          </Button>
        </form>

        <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('email')}>
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={sendOtp} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll email you a secure sign-in link and one-time code.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send sign-in code'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={AUTH_ROUTES.login} className="font-medium text-primary hover:underline">
          Back to all sign-in options
        </Link>
      </p>
    </form>
  );
}
