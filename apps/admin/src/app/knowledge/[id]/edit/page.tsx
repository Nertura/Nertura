'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { buttonVariants, cn } from '@nertura/ui';

import { KnowledgeArticleForm } from '@/components/knowledge-article-form';
import type { KnowledgeBankInput, KnowledgeBankItem } from '@/lib/knowledge-bank';

export default function EditKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [item, setItem] = useState<KnowledgeBankItem | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    void params.then(async ({ id: articleId }) => {
      setId(articleId);
      const res = await fetch(`/api/knowledge/${articleId}`);
      const json = await res.json();
      if (res.ok) setItem(json.item);
    });
  }, [params]);

  async function handleUpdate(data: KnowledgeBankInput) {
    if (!id) return;
    const res = await fetch(`/api/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Update failed');
    router.push('/knowledge');
    router.refresh();
  }

  if (!item) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const initial: KnowledgeBankInput = {
    title: item.title,
    category: item.category ?? 'article',
    crop: item.crop ?? '',
    disease: item.disease ?? '',
    symptoms: item.symptoms ?? '',
    treatment: item.treatment ?? '',
    prevention: item.prevention ?? '',
    source: item.source ?? '',
    language: item.language,
    content: item.content ?? '',
  };

  return (
    <div className="space-y-6">
      <Link href="/knowledge" className={cn(buttonVariants({ variant: 'ghost' }), 'px-0')}>
        ← Back to Knowledge Bank
      </Link>
      <h1 className="text-2xl font-semibold text-void">Edit article</h1>
      <KnowledgeArticleForm initial={initial} submitLabel="Save changes" onSubmit={handleUpdate} />
    </div>
  );
}
