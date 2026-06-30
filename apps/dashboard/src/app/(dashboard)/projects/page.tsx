import Link from 'next/link';

import { PageHeader } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';

export default async function ProjectsPage() {
  const ctx = await getDashboardContext();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, updated_at')
    .eq('user_id', ctx.userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Projeler"
        description="Çiftlik, tarla ve bitki hafıza modülleriniz"
      />
      <ul className="mt-6 divide-y rounded-lg border bg-card">
        {(projects ?? []).length === 0 && (
          <li className="p-6 text-center text-sm text-muted-foreground">
            Henüz proje yok. Çiftlik ve tarlalarınızı{' '}
            <Link href="/farms" className="text-signal underline">
              buradan
            </Link>{' '}
            ekleyebilirsiniz.
          </li>
        )}
        {(projects ?? []).map((p) => (
          <li key={p.id} className="px-4 py-3">
            <p className="font-medium text-void">{p.name}</p>
            {p.description && (
              <p className="text-sm text-muted-foreground">{p.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
