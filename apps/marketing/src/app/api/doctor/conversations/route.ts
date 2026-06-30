import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { listGuestConversations } from '@/lib/guest-conversations';
import {
  GUEST_COUNT_COOKIE,
  GUEST_ID_COOKIE,
  getGuestUsageFromCookie,
  getGuestUsageFromDb,
} from '@/lib/guest-usage';
import { tryCreateAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;
    const admin = tryCreateAdminClient();

    const countCookie = cookieStore.get(GUEST_COUNT_COOKIE)?.value;
    const usage =
      guestId && admin
        ? await getGuestUsageFromDb(admin, guestId)
        : getGuestUsageFromCookie(countCookie);

    if (!guestId || !admin) {
      return NextResponse.json({
        conversations: [],
        usage,
        persisted: false,
      });
    }

    const conversations = await listGuestConversations(admin, guestId);

    return NextResponse.json({
      conversations,
      usage,
      persisted: true,
      activeGuestId: guestId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load conversations';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
