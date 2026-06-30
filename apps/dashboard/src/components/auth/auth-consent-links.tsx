'use client';

import Link from 'next/link';
import { useLayoutEffect, useState } from 'react';

import { getBrowserDashboardContext, getMarketingBaseUrl } from '@nertura/utils';

import { AUTH_COPY } from '@/lib/i18n/auth-copy';

function useMarketingSiteUrl(): string {
  const [siteUrl, setSiteUrl] = useState('https://nertura.com');

  useLayoutEffect(() => {
    setSiteUrl(getMarketingBaseUrl(getBrowserDashboardContext()));
  }, []);

  return siteUrl;
}

interface AuthConsentLinksProps {
  className?: string;
}

/** Structured legal consent — no string-split hacks. */
export function AuthConsentLinks({ className }: AuthConsentLinksProps) {
  const c = AUTH_COPY.register.consent;
  const siteUrl = useMarketingSiteUrl();

  return (
    <p className={className ?? 'text-center text-xs leading-relaxed text-muted-foreground'}>
      {c.prefix}{' '}
      <a
        href={`${siteUrl}/terms`}
        className="underline hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        {c.terms}
      </a>
      ,{' '}
      <a
        href={`${siteUrl}/privacy`}
        className="underline hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        {c.privacy}
      </a>{' '}
      {c.and}{' '}
      <a
        href={`${siteUrl}/kvkk`}
        className="underline hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        {c.kvkk}
      </a>
      {c.suffix}
    </p>
  );
}

interface AuthPhotoConsentProps {
  className?: string;
}

export function AuthPhotoConsent({ className }: AuthPhotoConsentProps) {
  const copy = AUTH_COPY.register;
  const siteUrl = useMarketingSiteUrl();

  return (
    <p className={className ?? 'text-center text-xs leading-relaxed text-muted-foreground'}>
      {copy.photoConsent}{' '}
      <a
        href={`${siteUrl}/photo-consent`}
        className="underline hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        {copy.photoConsentLink}
      </a>
    </p>
  );
}

interface AuthFooterLinksProps {
  className?: string;
}

export function AuthFooterLinks({ className }: AuthFooterLinksProps) {
  const copy = AUTH_COPY.footer;
  const siteUrl = useMarketingSiteUrl();

  return (
    <p className={className ?? 'text-center text-xs text-muted-foreground'}>
      <a href={`${siteUrl}/privacy`} className="hover:text-foreground">
        {copy.privacy}
      </a>
      {' · '}
      <a href={`${siteUrl}/terms`} className="hover:text-foreground">
        {copy.terms}
      </a>
      {' · '}
      <Link href={`${siteUrl}/kvkk`} className="hover:text-foreground">
        {AUTH_COPY.register.consent.kvkk}
      </Link>
    </p>
  );
}

/** Map Supabase auth errors to farmer-friendly Turkish copy. */
export function mapAuthError(message: string, context: 'login' | 'register' = 'login'): string {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'E-posta veya şifre hatalı.';
  }
  if (lower.includes('email not confirmed')) {
    return 'E-posta adresinizi onaylamanız gerekiyor. Gelen kutunuzu kontrol edin.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Bu e-posta ile kayıtlı bir hesap var. Giriş yapmayı deneyin.';
  }
  if (lower.includes('password') && lower.includes('weak')) {
    return 'Şifre yeterince güçlü değil. Daha uzun ve karmaşık bir şifre seçin.';
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Çok fazla deneme yapıldı. Lütfen kısa bir süre sonra tekrar deneyin.';
  }

  return context === 'register'
    ? 'Kayıt tamamlanamadı. Bilgilerinizi kontrol edip tekrar deneyin.'
    : 'Giriş başarısız. Bilgilerinizi kontrol edip tekrar deneyin.';
}
