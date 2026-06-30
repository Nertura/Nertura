/** Cross-app URL resolution — local, LAN, staging, production. Shared by marketing + dashboard. */

export const DASHBOARD_DEV_PORT = 3001;
export const MARKETING_DEV_PORT = 3000;
export const ADMIN_DEV_PORT = 3002;

const DEFAULT_LOCAL_DASHBOARD = 'http://localhost:3001';
const DEFAULT_LOCAL_MARKETING = 'http://localhost:3000';
const DEFAULT_PRODUCTION_DASHBOARD = 'https://app.nertura.com';
const DEFAULT_PRODUCTION_MARKETING = 'https://nertura.com';

export type DashboardUrlParams = {
  next?: string;
  q?: string;
  intent?: string;
  source?: string;
  conversation?: string;
  caseId?: string;
};

export type DashboardUrlContext = {
  hostname?: string | null;
  protocol?: string | null;
};

function normalizeBase(url: string): string {
  return url.replace(/\/$/, '');
}

function envDashboardUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_DASHBOARD_URL?.trim();
  return raw ? normalizeBase(raw) : undefined;
}

function envAppUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return raw ? normalizeBase(raw) : undefined;
}

function envMarketingUrl(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_MARKETING_URL?.trim() ??
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw ? normalizeBase(raw) : undefined;
}

export function isLocalHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
}

/** @alias isLocalHostname */
export const isLocalHost = isLocalHostname;

export function isPrivateLanHostname(hostname: string): boolean {
  return (
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)
  );
}

/** @alias isPrivateLanHostname */
export const isLanHost = isPrivateLanHostname;

export function isAllowedDevHostname(hostname: string): boolean {
  return isLocalHostname(hostname) || isPrivateLanHostname(hostname);
}

export function isProductionNerturaHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'nertura.com' || h.endsWith('.nertura.com');
}

function productionDashboardUrl(): string {
  const envUrl = envDashboardUrl();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  const domain = process.env.NEXT_PUBLIC_DASHBOARD_DOMAIN?.trim();
  if (domain) {
    return domain.startsWith('http') ? normalizeBase(domain) : `https://${domain}`;
  }
  return DEFAULT_PRODUCTION_DASHBOARD;
}

function productionMarketingUrl(): string {
  const envUrl = envMarketingUrl();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return DEFAULT_PRODUCTION_MARKETING;
}

function protocolWithSlashes(protocol: string | null | undefined): string {
  if (!protocol) return 'http:';
  return protocol.endsWith(':') ? protocol : `${protocol}:`;
}

function lanDashboardBase(context: DashboardUrlContext, hostname: string): string {
  const proto = protocolWithSlashes(context.protocol);
  return `${proto}//${hostname}:${DASHBOARD_DEV_PORT}`;
}

function lanMarketingBase(context: DashboardUrlContext, hostname: string): string {
  const proto = protocolWithSlashes(context.protocol);
  return `${proto}//${hostname}:${MARKETING_DEV_PORT}`;
}

/**
 * Dashboard base URL for cross-app links.
 * Never returns localhost when context host is a LAN IP.
 */
export function getDashboardBaseUrl(context?: DashboardUrlContext): string {
  const hostname = context?.hostname?.split(':')[0]?.trim().toLowerCase() ?? null;

  if (hostname && !isLocalHostname(hostname)) {
    if (isPrivateLanHostname(hostname)) {
      return lanDashboardBase(context ?? {}, hostname);
    }
    return productionDashboardUrl();
  }

  if (hostname && isLocalHostname(hostname)) {
    return envDashboardUrl() ?? envAppUrl() ?? DEFAULT_LOCAL_DASHBOARD;
  }

  return envDashboardUrl() ?? envAppUrl() ?? DEFAULT_LOCAL_DASHBOARD;
}

/**
 * Marketing base URL — same LAN hostname, port 3000.
 * Never returns localhost when context host is a LAN IP.
 */
export function getMarketingBaseUrl(context?: DashboardUrlContext): string {
  const hostname = context?.hostname?.split(':')[0]?.trim().toLowerCase() ?? null;

  if (hostname && !isLocalHostname(hostname)) {
    if (isPrivateLanHostname(hostname)) {
      return lanMarketingBase(context ?? {}, hostname);
    }
    return productionMarketingUrl();
  }

  if (hostname && isLocalHostname(hostname)) {
    return envMarketingUrl() ?? DEFAULT_LOCAL_MARKETING;
  }

  return envMarketingUrl() ?? DEFAULT_LOCAL_MARKETING;
}

/** Dashboard app origin for auth callbacks (same rules as getDashboardBaseUrl). */
export function getAppBaseUrl(context?: DashboardUrlContext): string {
  return getDashboardBaseUrl(context);
}

/** Resolve dashboard base from an incoming HTTP request (Host header wins over env localhost). */
export function resolveAppBaseFromRequest(request: Request): string {
  return getDashboardBaseUrl(dashboardContextFromRequest(request));
}

/** Resolve full origin (scheme + host + port) from request headers. */
export function resolveRequestOrigin(request: Request): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (host) {
    const proto = (request.headers.get('x-forwarded-proto') ?? 'http').replace(/:$/, '');
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export function buildDashboardUrl(
  path: string,
  params?: DashboardUrlParams,
  context?: DashboardUrlContext
): string {
  const base = getDashboardBaseUrl(context);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (params?.next) url.searchParams.set('next', sanitizeInternalPath(params.next, '/doctor', context));
  if (params?.q) url.searchParams.set('q', params.q);
  if (params?.intent) url.searchParams.set('intent', params.intent);
  if (params?.source) url.searchParams.set('source', params.source);
  if (params?.conversation) url.searchParams.set('conversation', params.conversation);
  if (params?.caseId) url.searchParams.set('caseId', params.caseId);

  return url.toString();
}

export function getDashboardLoginUrl(
  params?: DashboardUrlParams,
  context?: DashboardUrlContext
): string {
  return buildDashboardUrl('/login', params, context);
}

/** @alias getDashboardLoginUrl */
export const getLoginUrl = getDashboardLoginUrl;

export function getDashboardRegisterUrl(
  params?: DashboardUrlParams,
  context?: DashboardUrlContext
): string {
  const merged: DashboardUrlParams = {
    next: params?.next ?? '/doctor',
    ...params,
  };
  return buildDashboardUrl('/register', merged, context);
}

/** @alias getDashboardRegisterUrl */
export const getRegisterUrl = getDashboardRegisterUrl;

export function getDashboardDoctorUrl(
  params?: DashboardUrlParams,
  context?: DashboardUrlContext
): string {
  return buildDashboardUrl('/doctor', params, context);
}

/** @alias getDashboardDoctorUrl */
export const getDoctorUrl = getDashboardDoctorUrl;

export function getAuthCallbackUrl(next?: string, context?: DashboardUrlContext): string {
  const base = getAppBaseUrl(context);
  const url = new URL('/auth/callback', base);
  url.searchParams.set('next', sanitizeInternalPath(next, '/doctor', context));
  return url.toString();
}

/** Block open redirects — internal paths only. Rejects localhost paths on LAN hosts. */
export function sanitizeInternalPath(
  path: string | null | undefined,
  fallback = '/doctor',
  context?: DashboardUrlContext
): string {
  if (!path?.trim()) return fallback;
  const trimmed = path.trim();
  if (!trimmed.startsWith('/')) return fallback;
  if (trimmed.startsWith('//')) return fallback;
  if (trimmed.includes('://')) return fallback;
  if (trimmed.includes('\\')) return fallback;

  const ctxHost = context?.hostname?.split(':')[0]?.toLowerCase();
  if (ctxHost && isPrivateLanHostname(ctxHost)) {
    const lower = trimmed.toLowerCase();
    if (lower.includes('localhost') || lower.includes('127.0.0.1')) {
      return fallback;
    }
  }

  return trimmed;
}

export function dashboardContextFromRequest(request: Request): DashboardUrlContext {
  const hostHeader = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const hostname = hostHeader?.split(':')[0] ?? null;
  const protoHeader = request.headers.get('x-forwarded-proto') ?? 'http';
  return {
    hostname,
    protocol: `${protoHeader}:`,
  };
}

export function dashboardContextFromHeaders(headersList: {
  get(name: string): string | null;
}): DashboardUrlContext {
  const hostHeader = headersList.get('x-forwarded-host') ?? headersList.get('host');
  const hostname = hostHeader?.split(':')[0] ?? null;
  const protoHeader = headersList.get('x-forwarded-proto') ?? 'http';
  return {
    hostname,
    protocol: `${protoHeader}:`,
  };
}

export function getBrowserDashboardContext(): DashboardUrlContext | undefined {
  if (typeof window === 'undefined') return undefined;
  return {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
  };
}

/** @alias getBrowserDashboardContext — same hostname drives marketing + dashboard LAN URLs */
export const getBrowserMarketingContext = getBrowserDashboardContext;

export function coerceDashboardAuthUrl(
  apiUrl: string | undefined,
  fallback: string,
  context?: DashboardUrlContext
): string {
  if (!apiUrl?.trim()) return fallback;
  try {
    const parsed = new URL(apiUrl);
    const host = context?.hostname?.split(':')[0]?.toLowerCase();
    if (
      host &&
      !isLocalHostname(host) &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return fallback;
    }
    return apiUrl;
  } catch {
    return fallback;
  }
}

export function containsLocalhostLeak(url: string, context?: DashboardUrlContext): boolean {
  try {
    const parsed = new URL(url);
    const host = context?.hostname?.split(':')[0]?.toLowerCase();
    if (!host || isLocalHostname(host)) return false;
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/** @deprecated Use getDashboardBaseUrl */
export function dashboardAppUrl(path = '', context?: DashboardUrlContext): string {
  const base = getDashboardBaseUrl(context);
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
