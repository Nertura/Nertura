import Link from 'next/link';

import { PageHeader } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';
import { CASE_PROGRESS_LABELS, CASE_STATUS_LABELS } from '@/lib/projects-engine';
import { createClient } from '@/lib/supabase/server';

interface LinkedCaseRow {
  id: string;
  conversation_id: string | null;
  status: string;
  progress: string | null;
  crop_label: string | null;
  diagnosis_summary: string | null;
}

export default async function HistoryPage() {
  const ctx = await getDashboardContext();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select('id, title, updated_at, metadata')
    .eq('user_id', ctx.userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(50);

  const conversationIds = (conversations ?? []).map((c) => c.id as string);
  const caseByConversation = new Map<string, LinkedCaseRow>();

  if (conversationIds.length > 0) {
    const { data: linkedCases } = await supabase
      .from('field_cases')
      .select('id, conversation_id, status, progress, crop_label, diagnosis_summary')
      .eq('user_id', ctx.userId)
      .in('conversation_id', conversationIds);

    for (const row of linkedCases ?? []) {
      if (row.conversation_id) {
        caseByConversation.set(row.conversation_id as string, row as LinkedCaseRow);
      }
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Geçmiş"
        description="Önceki AI Tarım Doktoru konuşmalarınız"
      />
      <ul className="mt-6 divide-y rounded-lg border bg-card">
        {(conversations ?? []).length === 0 && (
          <li className="p-6 text-center text-sm text-muted-foreground">
            Henüz kayıtlı konuşma yok.{' '}
            <Link href="/doctor" className="text-signal underline">
              İlk sorunuzu sorun
            </Link>
          </li>
        )}
        {(conversations ?? []).map((c) => {
          const linkedCase = caseByConversation.get(c.id as string);
          const continueHref = linkedCase
            ? `/doctor?conversation=${c.id}&caseId=${linkedCase.id}`
            : `/history/${c.id}`;

          return (
            <li key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 hover:bg-muted/50">
                <div className="min-w-0 flex-1">
                  <Link href={continueHref}>
                    <p className="font-medium text-void">{c.title ?? 'Konuşma'}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.updated_at ? new Date(c.updated_at).toLocaleString('tr-TR') : ''}
                    </p>
                  </Link>
                  {linkedCase ? (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {linkedCase.crop_label ? (
                        <p>
                          <span className="font-medium text-void">{linkedCase.crop_label}</span>
                        </p>
                      ) : null}
                      {linkedCase.diagnosis_summary ? (
                        <p className="line-clamp-2">{linkedCase.diagnosis_summary}</p>
                      ) : null}
                      <p>
                        {CASE_STATUS_LABELS[linkedCase.status]?.tr ?? linkedCase.status}
                        {linkedCase.progress
                          ? ` · ${CASE_PROGRESS_LABELS[linkedCase.progress as keyof typeof CASE_PROGRESS_LABELS]?.tr ?? linkedCase.progress}`
                          : ''}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {linkedCase ? (
                    <>
                      <Link
                        href={`/cases/${linkedCase.id}`}
                        className="text-xs font-medium text-signal hover:underline"
                      >
                        Vaka Takibi
                      </Link>
                      <Link
                        href={continueHref}
                        className="text-xs text-muted-foreground hover:text-void hover:underline"
                      >
                        Devam et
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={continueHref}
                      className="text-xs text-muted-foreground hover:text-void hover:underline"
                    >
                      Devam et
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
