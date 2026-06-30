import type { Config } from 'tailwindcss';
import sharedConfig from '@nertura/ui/tailwind.config';

const config: Config = {
  ...sharedConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/geo/src/**/*.{ts,tsx}',
  ],
};

export default config;
