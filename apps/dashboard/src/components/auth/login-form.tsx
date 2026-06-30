'use client';



import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';

import { useState } from 'react';



import { Alert, AlertDescription, AlertTitle, AppButton, AppInput, Label } from '@nertura/ui';



import { mapAuthError } from '@/components/auth/auth-consent-links';

import { getBrowserDashboardContext, sanitizeInternalPath } from '@nertura/utils';

import { AUTH_ROUTES } from '@/lib/auth/constants';

import { AUTH_COPY } from '@/lib/i18n/auth-copy';

import { createClient } from '@/lib/supabase/client';



export function LoginForm() {

  const copy = AUTH_COPY.login;

  const router = useRouter();

  const searchParams = useSearchParams();

  const next = sanitizeInternalPath(searchParams.get('next'), '/doctor', getBrowserDashboardContext());

  const urlError = searchParams.get('error');



  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(

    urlError === 'auth_callback_failed' ? AUTH_COPY.login.authCallbackFailed : null

  );

  const [loading, setLoading] = useState(false);



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setError(null);

    setLoading(true);



    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({

      email,

      password,

    });



    setLoading(false);



    if (signInError) {

      setError(mapAuthError(signInError.message, 'login'));

      return;

    }



    router.push(next);

    router.refresh();

  }



  return (

    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (

        <Alert variant="destructive">

          <AlertTitle>{copy.errorTitle}</AlertTitle>

          <AlertDescription>{error}</AlertDescription>

        </Alert>

      )}



      <div className="space-y-4">

        <div className="space-y-2">

          <Label htmlFor="email">{copy.email}</Label>

          <AppInput

            id="email"

            type="email"

            placeholder={copy.emailPlaceholder}

            autoComplete="email"

            required

            value={email}

            onChange={(e) => setEmail(e.target.value)}

          />

        </div>



        <div className="space-y-2">

          <div className="flex items-center justify-between gap-2">

            <Label htmlFor="password">{copy.password}</Label>

            <Link

              href={AUTH_ROUTES.forgotPassword}

              className="text-sm text-primary hover:underline"

            >

              {copy.forgotPassword}

            </Link>

          </div>

          <AppInput

            id="password"

            type="password"

            autoComplete="current-password"

            required

            value={password}

            onChange={(e) => setPassword(e.target.value)}

          />

        </div>

      </div>



      <AppButton type="submit" fullWidth disabled={loading}>

        {loading ? copy.submitting : copy.submit}

      </AppButton>



      <p className="text-center text-sm text-muted-foreground">

        {copy.noAccount}{' '}

        <Link href={AUTH_ROUTES.register} className="font-medium text-primary hover:underline">

          {copy.createAccount}

        </Link>

      </p>

    </form>

  );

}

