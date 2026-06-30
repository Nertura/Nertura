import { PageHeader } from '@/components/dashboard/page-header';
import { createClient } from '@/lib/supabase/server';

export default async function KnowledgePage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from('knowledge_items')
    .select('type, name_tr, name_en, slug, summary_tr')
    .order('type')
    .order('name_tr')
    .limit(100);

  const grouped = (items ?? []).reduce<
    Record<string, NonNullable<typeof items>>
  >((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {});

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Bilgi Bankası"
        description="Bitki, hastalık, zararlı ve tedavi referansları"
      />
      <div className="mt-6 space-y-8">
        {Object.entries(grouped).map(([type, rows]) => (
          <section key={type}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {type}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {(rows ?? []).map((item) => (
                <li key={item.slug} className="rounded-lg border bg-card p-3">
                  <p className="font-medium text-void">{item.name_tr}</p>
                  <p className="text-xs text-muted-foreground">{item.name_en}</p>
                  {item.summary_tr && (
                    <p className="mt-1 text-sm text-muted-foreground">{item.summary_tr}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!items?.length && (
          <p className="text-center text-sm text-muted-foreground">
            Bilgi bankası henüz yüklenmedi.
          </p>
        )}
      </div>
    </div>
  );
}
