-- Guest doctor persistence via security definer RPC (server-side only via API route).
-- Allows saving conversations without exposing service role to the client.

create or replace function public.save_guest_doctor_turn(
  p_guest_id uuid,
  p_conversation_id uuid,
  p_question text,
  p_assistant_content text,
  p_diagnosis jsonb,
  p_raw_gemini jsonb default null,
  p_raw_openai jsonb default null,
  p_raw_brain jsonb default null,
  p_knowledge_hits jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
  v_user_message_id uuid;
  v_assistant_message_id uuid;
  v_analysis_id uuid;
  v_now timestamptz := timezone('utc', now());
begin
  if p_guest_id is null then
    raise exception 'guest_id required';
  end if;

  if p_conversation_id is not null then
    update public.ai_conversations
    set
      title = left(p_question, 80),
      updated_at = v_now,
      metadata = jsonb_build_object(
        'type', 'guest_doctor',
        'source', 'marketing_homepage',
        'last_diagnosis', p_diagnosis
      )
    where id = p_conversation_id
      and guest_id = p_guest_id;

    if not found then
      raise exception 'Conversation not found for guest';
    end if;

    v_conversation_id := p_conversation_id;
  else
    insert into public.ai_conversations (guest_id, title, metadata)
    values (
      p_guest_id,
      left(p_question, 80),
      jsonb_build_object(
        'type', 'guest_doctor',
        'source', 'marketing_homepage',
        'last_diagnosis', p_diagnosis
      )
    )
    returning id into v_conversation_id;
  end if;

  insert into public.ai_messages (conversation_id, guest_id, role, content, metadata)
  values (
    v_conversation_id,
    p_guest_id,
    'user',
    p_question,
    jsonb_build_object('source', 'marketing_homepage')
  )
  returning id into v_user_message_id;

  insert into public.ai_messages (conversation_id, guest_id, role, content, metadata)
  values (
    v_conversation_id,
    p_guest_id,
    'assistant',
    p_assistant_content,
    jsonb_build_object('diagnosis', p_diagnosis, 'source', 'marketing_homepage')
  )
  returning id into v_assistant_message_id;

  insert into public.ai_analyses (
    conversation_id,
    guest_id,
    question,
    diagnosis,
    symptoms,
    risk_level,
    treatment,
    prevention,
    notes,
    confidence,
    source,
    raw_gemini,
    raw_openai,
    raw_brain,
    knowledge_hits,
    status,
    metadata
  )
  values (
    v_conversation_id,
    p_guest_id,
    p_question,
    p_diagnosis->>'diagnosis',
    p_diagnosis->>'symptoms',
    coalesce((p_diagnosis->>'risk_level')::public.risk_level, 'medium'),
    p_diagnosis->>'treatment',
    p_diagnosis->>'prevention',
    p_diagnosis->>'notes',
    (p_diagnosis->>'confidence')::numeric,
    coalesce(p_diagnosis->>'source', 'brain'),
    p_raw_gemini,
    p_raw_openai,
    p_raw_brain,
    coalesce(p_knowledge_hits, '[]'::jsonb),
    'completed',
    jsonb_build_object('type', 'guest_homepage')
  )
  returning id into v_analysis_id;

  return jsonb_build_object(
    'conversationId', v_conversation_id,
    'userMessageId', v_user_message_id,
    'assistantMessageId', v_assistant_message_id,
    'analysisId', v_analysis_id
  );
end;
$$;

revoke all on function public.save_guest_doctor_turn from public;
grant execute on function public.save_guest_doctor_turn to service_role;
