import { redirect } from 'next/navigation';



import { getDashboardContext } from '@/lib/auth/context';

import { createClient } from '@/lib/supabase/server';



/** Unified doctor chat — legacy history detail redirects here. */

export default async function ConversationDetailPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const ctx = await getDashboardContext();

  const supabase = await createClient();



  const { data: conversation } = await supabase

    .from('ai_conversations')

    .select('id')

    .eq('id', id)

    .eq('user_id', ctx.userId)

    .is('deleted_at', null)

    .maybeSingle();



  if (!conversation) {

    redirect('/history');

  }



  redirect(`/doctor?conversation=${id}`);

}


