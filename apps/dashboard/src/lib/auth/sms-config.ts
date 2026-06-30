/** Server-side SMS auth configuration. Never enable without CAPTCHA + provider setup. */

export function isSmsAuthEnabled(): boolean {
  return process.env.ENABLE_SMS_AUTH === 'true';
}

export function isSmsCaptchaRequired(): boolean {
  return process.env.REQUIRE_SMS_CAPTCHA === 'true';
}

export function getSmsCaptchaSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_SMS_CAPTCHA_SITE_KEY?.trim() || null;
}

/** Placeholder for future hCaptcha/Turnstile verification. */
export async function verifySmsCaptcha(_token: string | null | undefined): Promise<boolean> {
  if (!isSmsCaptchaRequired()) return true;
  if (!_token?.trim()) return false;
  // Integrate provider verification here before enabling SMS in production.
  return false;
}
