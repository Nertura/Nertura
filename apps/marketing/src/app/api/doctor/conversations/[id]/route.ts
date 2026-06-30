import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { loadGuestConversationMessages } from '@/lib/guest-conversations';
import { GUEST_ID_COOKIE } from '@/lib/guest-usage';
import { tryCreateAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;
    const admin = tryCreateAdminClient();

    if (!guestId || !admin) {
      return NextResponse.json({ messages: [], persisted: false });
    }

    const messages = await loadGuestConversationMessages(admin, guestId, id);

    return NextResponse.json({
      conversationId: id,
      messages,
      persisted: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load conversation';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
