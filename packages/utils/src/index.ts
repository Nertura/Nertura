/** Shared utilities — no app-specific logic. */

export function absoluteUrl(path: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Supabase nested selects may return an object or a one-element array. */
export function relatedName(
  relation: { name: string } | { name: string }[] | null | undefined
): string | undefined {
  if (!relation) return undefined;
  return Array.isArray(relation) ? relation[0]?.name : relation.name;
}

export {
  normalizeImageMimeType,
  sniffImageMime,
  validateImageInput,
  type AllowedImageMime,
  type ImageValidationErrorCode,
} from './image-validation';

export {
  ADMIN_DEV_PORT,
  DASHBOARD_DEV_PORT,
  MARKETING_DEV_PORT,
  buildDashboardUrl,
  coerceDashboardAuthUrl,
  containsLocalhostLeak,
  dashboardAppUrl,
  dashboardContextFromHeaders,
  dashboardContextFromRequest,
  getAppBaseUrl,
  getAuthCallbackUrl,
  getBrowserDashboardContext,
  getBrowserMarketingContext,
  getDashboardBaseUrl,
  getDashboardDoctorUrl,
  getDashboardLoginUrl,
  getDashboardRegisterUrl,
  getDoctorUrl,
  getLoginUrl,
  getMarketingBaseUrl,
  getRegisterUrl,
  isAllowedDevHostname,
  isLanHost,
  isLocalHost,
  isLocalHostname,
  isPrivateLanHostname,
  isProductionNerturaHostname,
  resolveAppBaseFromRequest,
  resolveRequestOrigin,
  sanitizeInternalPath,
  type DashboardUrlContext,
  type DashboardUrlParams,
} from './nertura-urls';
