#!/usr/bin/env tsx
/**
 * Dashboard interaction regression guard — pnpm test:dashboard-interactions
 *
 * Static source checks for P0 clickability fixes (flex overflow + overlay portals).
 * Complements manual browser QA on authenticated routes.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = process.cwd();

const CHECKS: Array<{ file: string; patterns: string[]; label: string }> = [
  {
    file: 'packages/ui/src/components/ai-chat/shell.tsx',
    patterns: ['min-h-0', 'z-50', 'shrink-0'],
    label: 'AiChatShell flex + header layering',
  },
  {
    file: 'packages/ui/src/components/dropdown-menu.tsx',
    patterns: ['createPortal', 'z-[100]'],
    label: 'DropdownMenu body portal',
  },
  {
    file: 'apps/dashboard/src/components/dashboard/shell.tsx',
    patterns: ['min-h-0', 'z-50', 'OverlayPortal'],
    label: 'DashboardShell flex + mobile drawer portal',
  },
  {
    file: 'apps/dashboard/src/components/doctor/chat-app.tsx',
    patterns: ['min-h-0 flex-1 overflow-hidden', 'min-h-0 flex-1 flex-col overflow-y-auto'],
    label: 'Doctor chat flex min-h-0',
  },
  {
    file: 'apps/dashboard/src/components/billing/upgrade-modal.tsx',
    patterns: ['OverlayPortal', 'if (!open) return null'],
    label: 'UpgradeModal portal + conditional mount',
  },
  {
    file: 'apps/dashboard/src/components/dashboard/user-menu.tsx',
    patterns: ['menu.profile', 'menu.account', 'menu.logout', 'menu.analysesCredits'],
    label: 'User menu item wiring',
  },
  {
    file: 'apps/dashboard/src/lib/i18n/dashboard-copy.ts',
    patterns: ["profile: 'Profil'", "logout: 'Çıkış Yap'", "analysesCredits: 'Analiz hakkı'"],
    label: 'User menu copy strings',
  },
];

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function main() {
  console.log('Dashboard interaction regression guard\n');

  for (const check of CHECKS) {
    const source = read(check.file);
    for (const pattern of check.patterns) {
      if (!source.includes(pattern)) {
        fail(`${check.label}: missing "${pattern}" in ${check.file}`);
      }
    }
    console.log(`  OK  ${check.label}`);
  }

  const userMenu = read('apps/dashboard/src/components/dashboard/user-menu.tsx');
  if (!userMenu.includes('menu.profile') || !userMenu.includes('menu.logout')) {
    fail('UserMenu must wire profile and logout copy keys');
  }

  console.log('\nPASS: interaction guard checks');
  console.log('\nBrowser QA checklist (authenticated):');
  console.log('  /doctor — KA menu, dark mode, bell, New, field selector, composer, send, image, Tarla Takibi');
  console.log('  /cases — filters, search, card CTAs');
  console.log('  /history — continue + case links');
  console.log('  /account, /settings — buttons clickable');
  console.log('  mobile — bottom nav + no invisible overlay');
}

main();
