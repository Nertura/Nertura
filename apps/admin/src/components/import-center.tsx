'use client';

import { useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
} from '@nertura/ui';

import {
  KNOWLEDGE_ITEM_FIELDS,
  KNOWLEDGE_IMPORT_TABLES,
  type KnowledgeImportTable,
} from '@/lib/import/types';

export function ImportCenter() {
  const [table, setTable] = useState<KnowledgeImportTable>('knowledge_items');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    total_rows: number;
    valid_rows: number;
    failed_rows?: number;
    errors?: string[];
    sample: unknown[];
  } | null>(null);
  const [result, setResult] = useState<{
    imported: number;
    failed?: number;
    slugs: string[];
    batchId?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent(text);
    if (file.name.endsWith('.json')) setFormat('json');
    else setFormat('csv');
    setPreview(null);
    setResult(null);
  }

  async function runImport(previewOnly: boolean) {
    setLoading(true);
    setError(null);
    if (!previewOnly) setResult(null);
    if (previewOnly) setPreview(null);

    try {
      const res = await fetch(`/api/import/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, content, preview: previewOnly }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Import failed');

      if (previewOnly) {
        setPreview(json);
      } else {
        setResult({
          imported: json.imported,
          failed: json.failed,
          slugs: json.slugs,
          batchId: json.batchId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  const csvExample = `${KNOWLEDGE_ITEM_FIELDS.join(',')}\nplant,Domates,Tomato,tomato,Sera domatesi,Greenhouse tomato,"[""Sarı yaprak""]","[]","[]","[]","[""tomato""]",seed,0.95,{}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-void">Veri İçe Aktarma</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CSV veya JSON ile bilgi bankası toplu yükleme. Önce doğrulama, sonra içe aktarma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Center</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table">Hedef tablo</Label>
            <select
              id="table"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={table}
              onChange={(e) => {
                setTable(e.target.value as KnowledgeImportTable);
                setPreview(null);
                setResult(null);
              }}
            >
              {KNOWLEDGE_IMPORT_TABLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <select
              id="format"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={format}
              onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Dosya yükle</Label>
            <input id="file" type="file" accept=".csv,.json,text/csv,application/json" onChange={handleFile} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">İçerik yapıştır</Label>
            <textarea
              id="content"
              className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={format === 'csv' ? csvExample : '[{"type":"plant","name_tr":"..."}]'}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading || !content.trim()}
              onClick={() => runImport(true)}
            >
              {loading ? 'Doğrulanıyor…' : 'Doğrula & Önizle'}
            </Button>
            <Button type="button" disabled={loading || !content.trim()} onClick={() => runImport(false)}>
              {loading ? 'İçe aktarılıyor…' : 'İçe Aktar'}
            </Button>
          </div>

          {preview && (
            <Alert>
              <AlertTitle>Önizleme</AlertTitle>
              <AlertDescription>
                Toplam: {preview.total_rows} · Geçerli: {preview.valid_rows}
                {preview.failed_rows ? ` · Hatalı: ${preview.failed_rows}` : ''}
                {preview.errors?.length ? (
                  <ul className="mt-2 list-disc pl-4">
                    {preview.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                ) : null}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant="success">
              <AlertTitle>İçe aktarma tamamlandı</AlertTitle>
              <AlertDescription>
                {result.imported} kayıt başarılı
                {result.failed ? `, ${result.failed} hatalı` : ''}
                {result.batchId ? ` · Batch: ${result.batchId}` : ''}
                {result.slugs.length ? `: ${result.slugs.join(', ')}` : ''}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
