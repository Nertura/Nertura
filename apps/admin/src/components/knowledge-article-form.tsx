'use client';

import { useState } from 'react';

import { Button, Input, Label } from '@nertura/ui';

import type { KnowledgeBankInput } from '@/lib/knowledge-bank';

const empty: KnowledgeBankInput = {
  title: '',
  category: 'article',
  crop: '',
  disease: '',
  symptoms: '',
  treatment: '',
  prevention: '',
  source: 'nertura_admin',
  language: 'en',
  content: '',
};

interface KnowledgeArticleFormProps {
  initial?: KnowledgeBankInput;
  submitLabel: string;
  onSubmit: (data: KnowledgeBankInput) => Promise<void>;
}

export function KnowledgeArticleForm({
  initial,
  submitLabel,
  onSubmit,
}: KnowledgeArticleFormProps) {
  const [form, setForm] = useState<KnowledgeBankInput>(initial ?? empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof KnowledgeBankInput>(key: K, value: KnowledgeBankInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" required value={form.title} onChange={(e) => setField('title', e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={form.category ?? ''} onChange={(e) => setField('category', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input id="language" value={form.language ?? 'en'} onChange={(e) => setField('language', e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="crop">Crop</Label>
          <Input id="crop" value={form.crop ?? ''} onChange={(e) => setField('crop', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="disease">Disease</Label>
          <Input id="disease" value={form.disease ?? ''} onChange={(e) => setField('disease', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">Symptoms</Label>
        <textarea
          id="symptoms"
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.symptoms ?? ''}
          onChange={(e) => setField('symptoms', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment">Treatment</Label>
        <textarea
          id="treatment"
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.treatment ?? ''}
          onChange={(e) => setField('treatment', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prevention">Prevention</Label>
        <textarea
          id="prevention"
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.prevention ?? ''}
          onChange={(e) => setField('prevention', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <textarea
          id="content"
          className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.content ?? ''}
          onChange={(e) => setField('content', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input id="source" value={form.source ?? ''} onChange={(e) => setField('source', e.target.value)} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
