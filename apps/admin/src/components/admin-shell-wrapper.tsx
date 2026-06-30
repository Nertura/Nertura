import { AdminShell } from '@/components/admin-shell';
import { getAdminSessionUser } from '@/lib/auth/session';

export async function AdminShellWrapper({ children }: { children: React.ReactNode }) {
  const user = await getAdminSessionUser();
  return <AdminShell userEmail={user?.email ?? null}>{children}</AdminShell>;
}
