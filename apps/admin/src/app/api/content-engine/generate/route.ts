import { NextResponse } from 'next/server';
import { z } from 'zod';

import { runContentIntelligence } from '@nertura/ai';

import { createAdminClient } from '@/lib/supabase/admin';

const FORMAT_TO_PLATFORM: Record<string, string> = {
  blog: 'blog',
  instagram_caption: 'instagram_reels',
  instagram_carousel: 'instagram_reels',
  reels_script: 'instagram_reels',
  tiktok_script: 'tiktok',
  youtube_shorts: 'youtube_shorts',
  youtube_long_outline: 'youtube_shorts',
  linkedin: 'blog',
  x_post: 'blog',
  newsletter: 'email',
};

const bodySchema = z.object({
  topic: z.string().min(3).max(500),
  formats: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const formats = body.formats?.length ? body.formats : Object.keys(FORMAT_TO_PLATFORM);
    const admin = createAdminClient();
    const created: Array<{ id: string; platform: string; title: string; provider: string }> = [];

    for (const format of formats) {
      const platform = FORMAT_TO_PLATFORM[format] ?? 'blog';
      const title = `${body.topic.slice(0, 80)} (${format})`;
      const draft = await runContentIntelligence(admin, body.topic, format);

      const { data, error } = await admin
        .from('media_content_queue')
        .insert({
          platform,
          title,
          status: 'draft',
          script: draft.script,
          metadata: {
            source: 'content_intelligence_engine',
            topic: body.topic,
            format,
            review_pending: true,
            auto_publish: false,
            provider: draft.provider,
            citations: draft.citations,
            evidence_cards: draft.evidenceCards,
          },
        })
        .select('id, platform, title')
        .single();

      if (error) throw error;
      if (data) created.push({ ...data, provider: draft.provider });
    }

    return NextResponse.json({ created, count: created.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Content generation failed' },
      { status: 400 }
    );
  }
}
