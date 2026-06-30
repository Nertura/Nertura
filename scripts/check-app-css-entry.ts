#!/usr/bin/env tsx
/**
 * Guard: app layouts must use local ./globals.css — pnpm test:app-css-entry
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const APPS = ['marketing', 'dashboard', 'admin'];
const BANNED = /@nertura\/ui\/globals\.css/;

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

function main() {
  const root = resolve(process.cwd(), 'apps');
  const failures: string[] = [];

  for (const app of APPS) {
    const appDir = join(root, app, 'src', 'app');
    const layouts = findLayoutFiles(appDir);
    for (const file of layouts) {
      const content = readFileSync(file, 'utf8');
      if (BANNED.test(content)) {
        failures.push(`${file}: imports @nertura/ui/globals.css — use ./globals.css`);
      }
      if (file.endsWith('app\\layout.tsx') || file.endsWith('app/layout.tsx')) {
        if (!content.includes("./globals.css") && !content.includes("'./globals.css'")) {
          failures.push(`${file}: root layout missing local ./globals.css import`);
        }
      }
    }
  }

  if (failures.length) {
    console.error('FAIL: app CSS entry guard');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log('PASS: all app root layouts use local ./globals.css');
}

main();
