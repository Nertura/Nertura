import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nertura.com';

interface GuestTrustFooterProps {
  privacyLabel: string;
  kvkkLabel: string;
  aiDisclaimerLabel: string;
}

export function GuestTrustFooter({
  privacyLabel,
  kvkkLabel,
  aiDisclaimerLabel,
}: GuestTrustFooterProps) {
  return (
    <footer
      className="border-t border-border/40 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6"
      role="contentinfo"
    >
      <nav aria-label="Yasal">
        <Link href="/privacy" className="hover:text-foreground">
          {privacyLabel}
        </Link>
        {' · '}
        <Link href="/kvkk" className="hover:text-foreground">
          {kvkkLabel}
        </Link>
        {' · '}
        <Link href="/ai-disclaimer" className="hover:text-foreground">
          {aiDisclaimerLabel}
        </Link>
        {' · '}
        <a href={siteUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">
          nertura.com
        </a>
      </nav>
    </footer>
  );
}
