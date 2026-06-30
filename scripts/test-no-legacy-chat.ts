#!/usr/bin/env tsx
/**
 * Legacy chat route guard — pnpm test:no-legacy-chat
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(process.cwd());
const SCAN_DIRS = [
  join(ROOT, 'apps/dashboard/src'),
  join(ROOT, 'apps/marketing/src'),
  join(ROOT, 'packages/ui/src'),
];

const BANNED = /\/api\/ai\/chat(?!['"]\s*\))/;

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      walk(full, files);
    } else if (/\.(tsx?|jsx?|md)$/.test(name)) {
      files.push(full);
    }
  }
  return files;
}

function main() {
  const hits: string[] = [];
  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      if (file.includes('api\\ai\\chat\\route') || file.includes('api/ai/chat/route')) continue;
      const content = readFileSync(file, 'utf8');
      if (BANNED.test(content) || content.includes("fetch('/api/ai/chat") || content.includes('fetch("/api/ai/chat')) {
        hits.push(file);
      }
    }
  }

  const routePath = join(ROOT, 'apps/dashboard/src/app/api/ai/chat/route.ts');
  const route = readFileSync(routePath, 'utf8');
  if (!route.includes('410') || !route.includes('/api/ai/doctor')) {
    hits.push(`${routePath}: must return 410 Gone with doctor migration hint`);
  }

  if (hits.length) {
    console.error('FAIL: legacy /api/ai/chat references found');
    hits.forEach((h) => console.error(`  - ${h}`));
    process.exit(1);
  }

  console.log('PASS: no active legacy /api/ai/chat callers; route returns 410');
}

main();
