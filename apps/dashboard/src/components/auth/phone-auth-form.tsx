'use client';

import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle, buttonVariants, cn, Input, Label } from '@nertura/ui';

import { AUTH_ROUTES } from '@/lib/auth/constants';
import { AUTH_COPY } from '@/lib/i18n/auth-copy';

export function PhoneAuthForm() {
  const copy = AUTH_COPY.phoneLogin;
  const smsEnabled = process.env.NEXT_PUBLIC_ENABLE_SMS_AUTH === 'true';

  if (!smsEnabled) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTitle>{copy.comingSoonTitle}</AlertTitle>
          <AlertDescription>{copy.comingSoonBody}</AlertDescription>
        </Alert>
        <Link
          href={AUTH_ROUTES.login}
          className={cn(buttonVariants({ variant: 'outline' }), 'h-11 w-full justify-center rounded-xl')}
        >
          {copy.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Alert>
        <AlertDescription>{copy.scaffoldNote}</AlertDescription>
      </Alert>
      <div className="space-y-2">
        <Label htmlFor="phone">{copy.phoneLabel}</Label>
        <Input id="phone" type="tel" placeholder={copy.phonePlaceholder} disabled className="h-11 rounded-xl" />
      </div>
      <button type="submit" className={cn(buttonVariants(), 'h-11 w-full rounded-xl')} disabled>
        {copy.sendCode}
      </button>
    </form>
  );
}
