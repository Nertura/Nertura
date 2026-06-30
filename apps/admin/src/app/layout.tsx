import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { SkipLink } from '@nertura/ui';

import { AdminProviders } from '@/components/admin-providers';
import { AdminShellWrapper } from '@/components/admin-shell-wrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Nertura Admin',
  description: 'Nertura platform administration console.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <AdminProviders>
          <SkipLink />
          <AdminShellWrapper>{children}</AdminShellWrapper>
        </AdminProviders>
      </body>
    </html>
  );
}
