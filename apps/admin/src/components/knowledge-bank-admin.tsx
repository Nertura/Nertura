'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Button, Input, buttonVariants, cn } from '@nertura/ui';

import type { KnowledgeBankItem } from '@/lib/knowledge-bank';

export function KnowledgeBankAdmin() {
  const [items, setItems] = useState<KnowledgeBankItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importContent, setImportContent] = useState('');
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    const url = q ? `/api/knowledge?q=${encodeURIComponent(q)}` : '/api/knowledge';
    const res = await fetch(url);
    const json = await res.json();
    setItems(json.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this article?')) return;
    await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
    await load(query);
  }

  async function runImport(preview: boolean) {
    setImportMsg(null);
    const res = await fetch('/api/knowledge/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: importFormat, content: importContent, preview }),
    });
    const json = await res.json();
    if (!res.ok) {
      setImportMsg(json.error ?? 'Import failed');
      return;
    }
    if (preview) {
      setImportMsg(`Preview: ${json.valid_rows}/${json.total_rows} valid rows`);
    } else {
      setImportMsg(`Imported ${json.imported} articles`);
      setImportContent('');
      await load(query);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-void">Nertura Knowledge Bank</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage articles used by the AI Agriculture Doctor search engine.
          </p>
        </div>
        <Link href="/knowledge/new" className={cn(buttonVariants())}>
          New article
        </Link>
      </div>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="font-medium text-void">Import CSV / JSON</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Columns: title, category, crop, disease, symptoms, treatment, prevention, source, language, content
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant={importFormat === 'csv' ? 'default' : 'outline'} onClick={() => setImportFormat('csv')}>
            CSV
          </Button>
          <Button type="button" variant={importFormat === 'json' ? 'default' : 'outline'} onClick={() => setImportFormat('json')}>
            JSON
          </Button>
          <input
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImportContent(await file.text());
              if (file.name.endsWith('.json')) setImportFormat('json');
            }}
          />
        </div>
        <textarea
          className="mt-3 min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Paste CSV or JSON array…"
          value={importContent}
          onChange={(e) => setImportContent(e.target.value)}
        />
        <div className="mt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={() => runImport(true)} disabled={!importContent.trim()}>
            Preview
          </Button>
          <Button type="button" onClick={() => runImport(false)} disabled={!importContent.trim()}>
            Import
          </Button>
        </div>
        {importMsg && <p className="mt-2 text-sm text-muted-foreground">{importMsg}</p>}
      </section>

      <section>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Search title, crop, disease…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={() => load(query)}>
            Search
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="divide-y rounded-lg border bg-card">
            {items.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No articles yet.</li>
            )}
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-medium text-void">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category}
                    {item.crop ? ` · ${item.crop}` : ''}
                    {item.disease ? ` · ${item.disease}` : ''}
                    {' · '}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/knowledge/${item.id}/edit`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Edit
                  </Link>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
