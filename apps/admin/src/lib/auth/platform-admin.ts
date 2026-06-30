export function isPlatformAdmin(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  return user.app_metadata?.role === 'platform_admin';
}
