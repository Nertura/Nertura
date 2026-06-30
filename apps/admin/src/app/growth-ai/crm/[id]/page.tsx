import { notFound } from 'next/navigation';

import { CrmDetailClient } from '@/components/growth/crm-detail-client';
import {
  computeRelationshipScore,
  getLeadById,
  getLeadEmailHistory,
  getLeadInteractions,
  getLeadNotes,
} from '@/lib/growth/leads';

export default async function CrmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let lead = null;
  try {
    lead = await getLeadById(id);
  } catch {
    lead = null;
  }
  if (!lead) notFound();

  const [notes, interactions, emails] = await Promise.all([
    getLeadNotes(id).catch(() => []),
    getLeadInteractions(id).catch(() => []),
    getLeadEmailHistory(id).catch(() => []),
  ]);

  const relationshipScore = computeRelationshipScore(lead, emails.length, notes.length);

  return (
    <CrmDetailClient
      lead={lead}
      notes={notes}
      interactions={interactions}
      emails={emails}
      relationshipScore={relationshipScore}
    />
  );
}
