'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { buttonVariants, cn } from '@nertura/ui';

import { KnowledgeArticleForm } from '@/components/knowledge-article-form';
import type { KnowledgeBankInput } from '@/lib/knowledge-bank';

export default function NewKnowledgePage() {
  const router = useRouter();

  async function handleCreate(data: KnowledgeBankInput) {
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Create failed');
    router.push('/knowledge');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link href="/knowledge" className={cn(buttonVariants({ variant: 'ghost' }), 'px-0')}>
        ← Back to Knowledge Bank
      </Link>
      <h1 className="text-2xl font-semibold text-void">New article</h1>
      <KnowledgeArticleForm submitLabel="Create article" onSubmit={handleCreate} />
    </div>
  );
}
