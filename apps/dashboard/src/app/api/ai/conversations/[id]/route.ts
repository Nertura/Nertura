import { NextResponse } from 'next/server';

import { loadConversationMessages } from '@/lib/ai/conversations';
import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ctx = await getDashboardContext();
    const supabase = await createClient();
    const messages = await loadConversationMessages(supabase, id, ctx.userId);

    if (messages.length === 0) {
      const { data: conversation } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('id', id)
        .eq('user_id', ctx.userId)
        .maybeSingle();

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ conversationId: id, messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load conversation';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
