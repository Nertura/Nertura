import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { SkipLink } from '@nertura/ui';

import { DashboardProviders } from '@/components/dashboard/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Nertura Dashboard',
  description: 'Farmer and organization operations dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <DashboardProviders>
          <SkipLink />
          {children}
        </DashboardProviders>
      </body>
    </html>
  );
}
