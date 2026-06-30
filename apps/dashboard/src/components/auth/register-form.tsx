'use client';



import Link from 'next/link';

import { useState } from 'react';



import {

  Alert,

  AlertDescription,

  AlertTitle,

  AppButton,

  AppInput,

  Label,

} from '@nertura/ui';



import {

  AuthConsentLinks,

  AuthPhotoConsent,

  mapAuthError,

} from '@/components/auth/auth-consent-links';

import { getBrowserDashboardContext } from '@nertura/utils';

import { AUTH_ROUTES, getAuthCallbackUrl, MIN_PASSWORD_LENGTH } from '@/lib/auth/constants';

import { AUTH_COPY } from '@/lib/i18n/auth-copy';

import { createClient } from '@/lib/supabase/client';



export function RegisterForm() {

  const copy = AUTH_COPY.register;

  const [firstName, setFirstName] = useState('');

  const [lastName, setLastName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setError(null);



    if (password.length < MIN_PASSWORD_LENGTH) {

      setError(AUTH_COPY.resetPassword.passwordTooShort(MIN_PASSWORD_LENGTH));

      return;

    }



    if (password !== confirmPassword) {

      setError(AUTH_COPY.resetPassword.passwordMismatch);

      return;

    }



    setLoading(true);



    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({

      email,

      password,

      options: {

        emailRedirectTo: getAuthCallbackUrl('/onboarding', getBrowserDashboardContext()),

        data: {

          first_name: firstName,

          last_name: lastName,

        },

      },

    });



    if (signUpError) {

      setLoading(false);

      setError(mapAuthError(signUpError.message, 'register'));

      return;

    }



    if (data.user && data.session) {

      await supabase

        .from('users')

        .update({

          first_name: firstName,

          last_name: lastName,

        })

        .eq('id', data.user.id);

    }



    setLoading(false);

    setSuccess(true);

  }



  if (success) {

    return (

      <div className="space-y-4">

        <Alert variant="success">

          <AlertTitle>{copy.successTitle}</AlertTitle>

          <AlertDescription>{copy.successBody(email)}</AlertDescription>

        </Alert>

        <Link

          href={AUTH_ROUTES.login}

          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-input bg-background text-sm font-medium transition-colors hover:bg-muted"

        >

          {copy.successBackToLogin}

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



      <div className="grid gap-4 sm:grid-cols-2">

        <div className="space-y-2">

          <Label htmlFor="firstName">{copy.firstName}</Label>

          <AppInput

            id="firstName"

            autoComplete="given-name"

            required

            value={firstName}

            onChange={(e) => setFirstName(e.target.value)}

          />

        </div>

        <div className="space-y-2">

          <Label htmlFor="lastName">{copy.lastName}</Label>

          <AppInput

            id="lastName"

            autoComplete="family-name"

            required

            value={lastName}

            onChange={(e) => setLastName(e.target.value)}

          />

        </div>

      </div>



      <div className="space-y-2">

        <Label htmlFor="email">{copy.email}</Label>

        <AppInput

          id="email"

          type="email"

          autoComplete="email"

          required

          value={email}

          onChange={(e) => setEmail(e.target.value)}

        />

      </div>



      <div className="space-y-2">

        <Label htmlFor="password">{copy.password}</Label>

        <AppInput

          id="password"

          type="password"

          autoComplete="new-password"

          required

          minLength={MIN_PASSWORD_LENGTH}

          value={password}

          onChange={(e) => setPassword(e.target.value)}

        />

        <p className="text-xs text-muted-foreground">{copy.passwordHint(MIN_PASSWORD_LENGTH)}</p>

      </div>



      <div className="space-y-2">

        <Label htmlFor="confirmPassword">{copy.confirmPassword}</Label>

        <AppInput

          id="confirmPassword"

          type="password"

          autoComplete="new-password"

          required

          value={confirmPassword}

          onChange={(e) => setConfirmPassword(e.target.value)}

        />

      </div>



      <AppButton type="submit" fullWidth disabled={loading}>

        {loading ? copy.submitting : copy.submit}

      </AppButton>



      <AuthConsentLinks />

      <AuthPhotoConsent />



      <p className="text-center text-sm text-muted-foreground">

        {copy.hasAccount}{' '}

        <Link href={AUTH_ROUTES.login} className="font-medium text-primary hover:underline">

          {copy.signIn}

        </Link>

      </p>

    </form>

  );

}

