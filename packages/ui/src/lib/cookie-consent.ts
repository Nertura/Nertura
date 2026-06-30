/** Cookie consent storage — Book 05 / KVKK ePrivacy compliance. */
export const COOKIE_CONSENT_STORAGE_KEY = 'nertura_cookie_consent';
export const COOKIE_CONSENT_COOKIE_NAME = 'nertura_consent';
export const COOKIE_CONSENT_VERSION = 1;

export interface CookieConsentPreferences {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

export type CookieConsentCategory = 'analytics' | 'marketing';

const DEFAULT_REJECTED: CookieConsentPreferences = {
  version: COOKIE_CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  decidedAt: new Date(0).toISOString(),
};

export function getDefaultCookieConsent(): CookieConsentPreferences {
  return { ...DEFAULT_REJECTED, decidedAt: new Date().toISOString() };
}

export function parseCookieConsent(raw: string | null | undefined): CookieConsentPreferences | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsentPreferences;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    if (parsed.necessary !== true) return null;
    return {
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      decidedAt: parsed.decidedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readCookieConsentFromStorage(): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  return parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

export function writeCookieConsent(preferences: CookieConsentPreferences): void {
  if (typeof window === 'undefined') return;
  const payload: CookieConsentPreferences = {
    ...preferences,
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent('nertura:cookie-consent', { detail: payload }));
}

export function acceptAllCookieConsent(): CookieConsentPreferences {
  const prefs: CookieConsentPreferences = {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics: true,
    marketing: true,
    decidedAt: new Date().toISOString(),
  };
  writeCookieConsent(prefs);
  return prefs;
}

export function rejectOptionalCookieConsent(): CookieConsentPreferences {
  const prefs = getDefaultCookieConsent();
  writeCookieConsent(prefs);
  return prefs;
}

export function hasAnalyticsConsent(prefs: CookieConsentPreferences | null): boolean {
  return prefs?.analytics === true;
}

export function hasMarketingConsent(prefs: CookieConsentPreferences | null): boolean {
  return prefs?.marketing === true;
}

/** Hook point for future GA4/PostHog — no-op until scripts are wired. */
export function applyConsentToTracking(prefs: CookieConsentPreferences): void {
  if (!hasAnalyticsConsent(prefs) && !hasMarketingConsent(prefs)) return;
  // Analytics scripts load only after explicit consent (production checklist).
}
