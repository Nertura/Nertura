-- Allow public read of knowledge_items for marketing guest AI doctor KB search
create policy "knowledge_items_select_anon"
  on public.knowledge_items for select to anon
  using (true);
