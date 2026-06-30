import { createClient } from '@/lib/supabase/server';

export async function getAdminSessionUser() {
  if (process.env.ADMIN_AUTH_DISABLED === 'true' && process.env.NODE_ENV !== 'production') {
    return { email: 'dev@nertura.local', id: 'dev' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { email: user.email ?? 'Admin', id: user.id };
}
