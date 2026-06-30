import type { AppRole } from '@nertura/types';

const WRITE_ROLES: AppRole[] = ['owner', 'admin', 'manager', 'operator'];
const ADMIN_ROLES: AppRole[] = ['owner', 'admin'];

export function canWriteOperations(role: string | null | undefined): boolean {
  return WRITE_ROLES.includes(role as AppRole);
}

export function canAdminOrg(role: string | null | undefined): boolean {
  return ADMIN_ROLES.includes(role as AppRole);
}

export function isViewerOnly(role: string | null | undefined): boolean {
  return role === 'viewer' || role === 'member';
}
