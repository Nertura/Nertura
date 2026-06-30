const hits = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60_000; // 15 minutes
const MAX_EMAIL_REQUESTS = 5;
const MAX_IP_REQUESTS = 20;

export function checkOtpRateLimit(key: string, max: number): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}

export function checkEmailOtpLimits(email: string, ip: string) {
  const emailKey = `otp:email:${email.toLowerCase()}`;
  const ipKey = `otp:ip:${ip}`;

  const emailCheck = checkOtpRateLimit(emailKey, MAX_EMAIL_REQUESTS);
  if (!emailCheck.ok) {
    return {
      ok: false as const,
      retryAfter: emailCheck.retryAfter,
      reason: 'Too many requests for this email. Please wait and try again.',
    };
  }

  const ipCheck = checkOtpRateLimit(ipKey, MAX_IP_REQUESTS);
  if (!ipCheck.ok) {
    return {
      ok: false as const,
      retryAfter: ipCheck.retryAfter,
      reason: 'Too many requests. Please wait and try again.',
    };
  }

  return { ok: true as const };
}
