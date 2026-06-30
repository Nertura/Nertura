import {
  getAppBaseUrl,
  getAuthCallbackUrl as buildAuthCallbackUrl,
  getBrowserDashboardContext,
  sanitizeInternalPath,
  type DashboardUrlContext,
} from '@nertura/utils';

export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  magicLink: '/magic-link',
  phoneLogin: '/phone-login',
  callback: '/auth/callback',
  signOut: '/auth/signout',
  onboarding: '/onboarding',
  resetPassword: '/reset-password',
} as const;

export function getAuthCallbackUrl(next?: string, context?: DashboardUrlContext): string {
  return buildAuthCallbackUrl(next, context ?? getBrowserDashboardContext());
}

export function getAppOrigin(context?: DashboardUrlContext): string {
  return getAppBaseUrl(context ?? getBrowserDashboardContext());
}

export { sanitizeInternalPath };

export const MIN_PASSWORD_LENGTH = 12;
