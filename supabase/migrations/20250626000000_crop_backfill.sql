-- Ensure seed crops are explicitly set for accurate retrieval

update public.knowledge_items set crop = 'tomato' where slug = 'tomato';
update public.knowledge_items set crop = 'olive' where slug = 'olive-tree';
update public.knowledge_items set crop = 'lemon' where slug = 'lemon-tree';
update public.knowledge_items set crop = 'wheat' where slug = 'wheat';
update public.knowledge_items set crop = 'tomato' where slug = 'late-blight';
update public.knowledge_items set crop = 'wheat' where slug = 'powdery-mildew';
