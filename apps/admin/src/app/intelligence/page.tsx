import Link from 'next/link';

import { buttonVariants, cn } from '@nertura/ui';

const SECTIONS = [
  {
    href: '/intelligence/outcomes',
    title: 'Diagnosis Outcomes',
    description: '7/14/30-day follow-up results: solved, improved, no change, worse.',
  },
  {
    href: '/intelligence/disease-history',
    title: 'Disease History',
    description: 'Aggregated crop/disease ledger per user.',
  },
  {
    href: '/intelligence/memory-events',
    title: 'Memory Events',
    description: 'Structured learning events from every AI interaction.',
  },
  {
    href: '/intelligence/provider-outputs',
    title: 'Provider Outputs',
    description: 'Raw Gemini / synthesis outputs saved server-side.',
  },
  {
    href: '/intelligence/feedback',
    title: 'Feedback',
    description: 'User ratings: helpful, not helpful, solved, still sick, wrong diagnosis.',
  },
  {
    href: '/intelligence/wrong-diagnoses',
    title: 'Wrong Diagnoses',
    description: 'Cases flagged as incorrect — review for knowledge gaps.',
  },
  {
    href: '/intelligence/similar-cases',
    title: 'Similar Cases',
    description: 'Cross-linked memory events used during retrieval.',
  },
  {
    href: '/intelligence/knowledge-gaps',
    title: 'Knowledge Gaps',
    description: 'Low-confidence or fallback answers without KB match.',
  },
  { href: '/conversations', title: 'AI Conversations', description: 'Full conversation threads.' },
  { href: '/analyses', title: 'AI Analyses', description: 'Diagnosis records with provider metadata.' },
];

export default function IntelligenceHubPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-void">Intelligence Center</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Self-improvement data pipeline: collect → classify → store → review → improve prompts and
        knowledge. Nertura does not auto-retrain models — human review drives quality.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-auto flex-col items-start gap-1 whitespace-normal p-4 text-left'
            )}
          >
            <span className="font-semibold text-void">{s.title}</span>
            <span className="text-xs font-normal text-muted-foreground">{s.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
