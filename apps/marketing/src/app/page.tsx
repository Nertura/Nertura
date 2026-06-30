import { HomeDoctorForm } from '@/components/home-doctor-form';
import { GuestAuthHeader } from '@/components/guest-auth-header';
import { GuestTrustFooter } from '@/components/guest-trust-footer';
import { MARKETING_COPY } from '@/lib/marketing-copy';

export default function HomePage() {
  const copy = MARKETING_COPY.tr;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GuestAuthHeader />
      <main id="main-content" className="flex flex-1 flex-col">
        <HomeDoctorForm />
      </main>
      <GuestTrustFooter
        privacyLabel={copy.trustPrivacy}
        kvkkLabel={copy.trustKvkk}
        aiDisclaimerLabel={copy.trustAiDisclaimer}
      />
    </div>
  );
}
