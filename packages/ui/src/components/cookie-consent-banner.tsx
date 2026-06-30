'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings2, X } from 'lucide-react';

import {
  acceptAllCookieConsent,
  applyConsentToTracking,
  type CookieConsentPreferences,
  readCookieConsentFromStorage,
  rejectOptionalCookieConsent,
  writeCookieConsent,
} from '../lib/cookie-consent';
import { cn } from '../lib/utils';
import { Button } from './button';
import { OverlayPortal } from './overlay-portal';

export interface CookieConsentLegalLinks {
  privacy: string;
  kvkk: string;
  cookies: string;
}

const DEFAULT_LEGAL_LINKS: CookieConsentLegalLinks = {
  privacy: '/privacy',
  kvkk: '/kvkk',
  cookies: '/cookies',
};

const COPY = {
  bannerTitle: 'Çerez tercihleri',
  bannerBody:
    'Deneyiminizi iyileştirmek ve hizmet güvenliğini sağlamak için çerezler kullanıyoruz. Zorunlu olmayan çerezler yalnızca onayınızla etkinleştirilir.',
  accept: 'Kabul et',
  reject: 'Reddet',
  manage: 'Tercihleri yönet',
  modalTitle: 'Çerez tercihleri',
  modalSave: 'Kaydet',
  modalClose: 'Kapat',
  necessaryTitle: 'Zorunlu çerezler',
  necessaryDesc: 'Oturum, güvenlik ve temel site işlevleri için gereklidir. Kapatılamaz.',
  analyticsTitle: 'Analitik çerezler',
  analyticsDesc: 'Site kullanımını anonim olarak anlamamıza yardımcı olur.',
  marketingTitle: 'Pazarlama çerezleri',
  marketingDesc: 'Kampanya ölçümü ve ilgili içerik sunumu için kullanılır.',
  legalIntro: 'Detaylar:',
  privacy: 'Gizlilik Politikası',
  kvkk: 'KVKK',
  cookies: 'Çerez Politikası',
} as const;

interface CookieConsentBannerProps {
  legalLinks?: CookieConsentLegalLinks;
  className?: string;
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled ? 'cursor-not-allowed bg-muted' : checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-background shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
          disabled && 'opacity-70'
        )}
      />
    </button>
  );
}

export function CookieConsentBanner({
  legalLinks = DEFAULT_LEGAL_LINKS,
  className,
}: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<CookieConsentPreferences | null>(null);

  const finalize = useCallback((prefs: CookieConsentPreferences) => {
    applyConsentToTracking(prefs);
    setVisible(false);
    setModalOpen(false);
  }, []);

  useEffect(() => {
    const existing = readCookieConsentFromStorage();
    if (existing) {
      applyConsentToTracking(existing);
      setVisible(false);
      return;
    }
    setDraft({
      version: 1,
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    });
    setVisible(true);
  }, []);

  function openPreferences() {
    const current = readCookieConsentFromStorage() ?? {
      version: 1 as const,
      necessary: true as const,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    };
    setDraft(current);
    setModalOpen(true);
  }

  function handleAcceptAll() {
    finalize(acceptAllCookieConsent());
  }

  function handleReject() {
    finalize(rejectOptionalCookieConsent());
  }

  function handleSavePreferences() {
    if (!draft) return;
    writeCookieConsent(draft);
    finalize(draft);
  }

  if (!visible && !modalOpen) return null;

  return (
    <>
      {visible && !modalOpen && (
        <OverlayPortal>
          <div
            className={cn(
              'pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4',
              className
            )}
            role="region"
            aria-label={COPY.bannerTitle}
          >
            <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-md sm:p-5">
              <p className="text-sm font-medium text-foreground">{COPY.bannerTitle}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {COPY.bannerBody}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {COPY.legalIntro}{' '}
                <a href={legalLinks.privacy} className="underline hover:text-foreground">
                  {COPY.privacy}
                </a>
                {' · '}
                <a href={legalLinks.kvkk} className="underline hover:text-foreground">
                  {COPY.kvkk}
                </a>
                {' · '}
                <a href={legalLinks.cookies} className="underline hover:text-foreground">
                  {COPY.cookies}
                </a>
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 rounded-xl sm:flex-1"
                  onClick={handleAcceptAll}
                >
                  {COPY.accept}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl sm:flex-1"
                  onClick={handleReject}
                >
                  {COPY.reject}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl sm:flex-1"
                  onClick={openPreferences}
                >
                  <Settings2 className="h-4 w-4" aria-hidden />
                  {COPY.manage}
                </Button>
              </div>
            </div>
          </div>
        </OverlayPortal>
      )}

      {modalOpen && draft && (
        <OverlayPortal>
          <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
          >
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <h2 id="cookie-prefs-title" className="text-lg font-semibold text-foreground">
                  {COPY.modalTitle}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg"
                  aria-label={COPY.modalClose}
                  onClick={() => setModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/30 p-3">
                  <div>
                    <p className="text-sm font-medium">{COPY.necessaryTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{COPY.necessaryDesc}</p>
                  </div>
                  <Toggle checked disabled label={COPY.necessaryTitle} onChange={() => {}} />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
                  <div>
                    <p className="text-sm font-medium">{COPY.analyticsTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{COPY.analyticsDesc}</p>
                  </div>
                  <Toggle
                    checked={draft.analytics}
                    label={COPY.analyticsTitle}
                    onChange={(v) => setDraft({ ...draft, analytics: v })}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
                  <div>
                    <p className="text-sm font-medium">{COPY.marketingTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{COPY.marketingDesc}</p>
                  </div>
                  <Toggle
                    checked={draft.marketing}
                    label={COPY.marketingTitle}
                    onChange={(v) => setDraft({ ...draft, marketing: v })}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button type="button" className="h-10 flex-1 rounded-xl" onClick={handleSavePreferences}>
                  {COPY.modalSave}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 rounded-xl"
                  onClick={handleAcceptAll}
                >
                  {COPY.accept}
                </Button>
              </div>
            </div>
          </div>
        </OverlayPortal>
      )}
    </>
  );
}
