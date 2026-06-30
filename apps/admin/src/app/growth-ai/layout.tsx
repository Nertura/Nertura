import type { ReactNode } from 'react';

import { GrowthAiShell } from '@/components/growth/growth-ai-shell';

export default function GrowthAiLayout({ children }: { children: ReactNode }) {
  return <GrowthAiShell>{children}</GrowthAiShell>;
}
