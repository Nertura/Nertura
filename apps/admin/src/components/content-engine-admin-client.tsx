'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';

import { Button, Input, Label } from '@nertura/ui';

import { AdminDataList } from '@/components/admin-data-list';

interface ContentRow {
  id: string;
  platform: string;
  title: string;
  status: string;
  script?: string | null;
}

const FORMAT_OPTIONS = [
  { id: 'blog', label: 'Blog article' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'youtube_long_outline', label: 'YouTube long-form' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
  { id: 'tiktok_script', label: 'TikTok' },
  { id: 'reels_script', label: 'Instagram Reels' },
  { id: 'instagram_caption', label: 'Instagram post' },
  { id: 'instagram_carousel', label: 'Instagram carousel' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'x_post', label: 'Threads / X' },
  { id: 'facebook_post', label: 'Facebook' },
  { id: 'pinterest_pin', label: 'Pinterest' },
  { id: 'podcast_script', label: 'Podcast script' },
  { id: 'push_notification', label: 'Push notification' },
  { id: 'email_draft', label: 'Email draft' },
  { id: 'thumbnail_text', label: 'Thumbnail text' },
  { id: 'seo_metadata', label: 'SEO metadata' },
] as const;

export function ContentEngineAdminClient({ rows }: { rows: ContentRow[] }) {
  const [list, setList] = useState(rows);
  const [topic, setTopic] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['blog', 'instagram_caption']);
  const [generating, setGenerating] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setList(rows);
  }, [rows]);

  const toggleFormat = (id: string) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const generateDrafts = useCallback(async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setMessage(null);
    try {
      setGeneratingLabel(`Generating ${selectedFormats.length} draft(s) via Intelligence Engine…`);
      const res = await fetch('/api/content-engine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), formats: selectedFormats }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Generation failed');
      setMessage(
        `Created ${json.count} draft(s) — review queue only, no auto-publish. Provider: Nertura Intelligence Engine.`
      );
      setTopic('');
      setExpandedId(json.created?.[0]?.id ?? null);
      window.location.reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
      setGeneratingLabel(null);
    }
  }, [topic, selectedFormats]);

  const updateContentStatus = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    setMessage(null);
    try {
      const res = await fetch(`/api/content-engine/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Update failed');
      setList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      setMessage(`Content marked as ${status}. No auto-publish — schedule manually when ready.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Update failed');
    }
  }, []);

  const copyBody = async (body: string) => {
    await navigator.clipboard.writeText(body);
    setMessage('Copied to clipboard.');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Generate content drafts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          From one agriculture topic, generate multi-channel drafts via Nertura Intelligence Engine
          and Knowledge Bank. All outputs require human review — no auto-publishing.
        </p>
        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="content-topic">Topic</Label>
            <Input
              id="content-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Wheat yellowing in Mediterranean climate"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFormat(f.id)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  selectedFormats.includes(f.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input text-muted-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button type="button" onClick={() => void generateDrafts()} disabled={generating || !topic.trim()}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {generating ? 'Generating…' : 'Generate drafts (review queue)'}
          </Button>
          {generatingLabel && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {generatingLabel}
            </p>
          )}
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
        <p className="mt-4 text-xs text-amber-800 dark:text-amber-400">
          Future: image/video generation · voiceover — placeholders only.
        </p>
      </section>

      <AdminDataList
        title="Content review queue"
        description="TikTok, YouTube, Instagram, blog, newsletter — founder review before publish"
        rows={list}
        searchPlaceholder="Search title or platform…"
        searchKeys={['title', 'platform', 'status']}
        emptyMessage="Queue empty — generate drafts from a topic above."
        columns={[
          {
            key: 'title',
            header: 'Title',
            render: (r) => (
              <button
                type="button"
                className="text-left font-medium hover:underline"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                {r.title}
              </button>
            ),
          },
          { key: 'platform', header: 'Platform', render: (r) => r.platform },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                {r.status}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex items-center gap-1">
                {r.status === 'draft' && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void updateContentStatus(r.id, 'approved')}
                    >
                      Onayla
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void updateContentStatus(r.id, 'rejected')}
                    >
                      Reddet
                    </Button>
                  </>
                )}
                {r.script ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => void copyBody(r.script!)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      {expandedId && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {list.find((r) => r.id === expandedId)?.script ?? 'No script stored.'}
          </div>
          <p className="text-xs text-muted-foreground">
            Citations and evidence cards are stored in draft metadata for expert review before publish.
          </p>
        </div>
      )}
    </div>
  );
}
