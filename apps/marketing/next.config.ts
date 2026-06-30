import type { NextConfig } from 'next';

import { getDashboardBaseUrl } from '@nertura/utils';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

function dashboardIntakeUrl(): string {
  return `${getDashboardBaseUrl()}/intake`;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nertura/ui', '@nertura/types', '@nertura/utils', '@nertura/ai'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: '/intake',
        destination: dashboardIntakeUrl(),
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
