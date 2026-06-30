import { UpgradeModalProvider } from '@/components/billing/upgrade-modal-provider';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <UpgradeModalProvider>
      <div className="min-h-[100dvh] bg-background">{children}</div>
    </UpgradeModalProvider>
  );
}
