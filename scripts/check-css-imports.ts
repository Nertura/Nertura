#!/usr/bin/env tsx
/**
 * CSS import architecture guard — pnpm check:css-imports
 *
 * Ensures:
 * - App layout.tsx imports only local ./globals.css (never @nertura/ui/* directly)
 * - App globals.css imports shared design system from @nertura/ui
 * - App globals.css does not duplicate @tailwind directives
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const APPS = ['marketing', 'dashboard', 'admin'] as const;

const LAYOUT_BANNED = /@nertura\/ui\/(?:styles\/)?globals\.css/;
const GLOBALS_SHARED_IMPORT =
  /@import\s+["']@nertura\/ui\/(?:styles\/)?globals\.css["']\s*;/;
const GLOBALS_FORBIDDEN = /@tailwind\s+(base|components|utilities)/;

function findLayoutFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...findLayoutFiles(full));
    else if (name === 'layout.tsx') out.push(full);
  }
  return out;
}

function isRootLayout(file: string): boolean {
  return file.replace(/\\/g, '/').endsWith('src/app/layout.tsx');
}

function stripComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .trim();
}

function main() {
  const root = resolve(process.cwd(), 'apps');
  const failures: string[] = [];

  for (const app of APPS) {
    const appDir = join(root, app, 'src', 'app');
    const globalsPath = join(appDir, 'globals.css');

    try {
      const globalsRaw = readFileSync(globalsPath, 'utf8');
      const globals = stripComments(globalsRaw);

      if (!GLOBALS_SHARED_IMPORT.test(globalsRaw)) {
        failures.push(
          `${globalsPath}: must @import "@nertura/ui/styles/globals.css" (shared design system)`
        );
      }

      if (GLOBALS_FORBIDDEN.test(globalsRaw)) {
        failures.push(
          `${globalsPath}: must not contain @tailwind — shared package owns Tailwind entry`
        );
      }

      const lines = globals
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const nonImportLines = lines.filter((l) => !l.startsWith('@import'));
      if (nonImportLines.length > 0) {
        failures.push(
          `${globalsPath}: must only import shared CSS (found extra rules: ${nonImportLines[0]?.slice(0, 60)}...)`
        );
      }
    } catch {
      failures.push(`${globalsPath}: missing globals.css`);
    }

    const layouts = findLayoutFiles(appDir);
    for (const file of layouts) {
      const content = readFileSync(file, 'utf8');

      if (LAYOUT_BANNED.test(content)) {
        failures.push(
          `${file}: imports @nertura/ui globals directly — use import "./globals.css" only`
        );
      }

      if (isRootLayout(file)) {
        if (!content.includes('./globals.css')) {
          failures.push(`${file}: root layout missing import "./globals.css"`);
        }
      }
    }
  }

  if (failures.length) {
    console.error('FAIL: CSS import architecture guard');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log('PASS: CSS import architecture — apps use local globals → @nertura/ui/styles/globals.css');
}

main();
