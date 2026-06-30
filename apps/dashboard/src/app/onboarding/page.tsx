import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { requireOnboardingPending } from '@/lib/auth/session';
import { getOnboardingCopy } from '@/lib/i18n/onboarding-copy';

const copy = getOnboardingCopy('tr');

export const metadata = {
  title: copy.pageMeta.title,
  description: copy.pageMeta.description,
};
export default async function OnboardingPage() {
  await requireOnboardingPending();

  return <OnboardingWizard />;
}
