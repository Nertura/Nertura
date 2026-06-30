import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const TARGETS = [
  join(ROOT, 'apps', 'marketing', '.next'),
  join(ROOT, 'apps', 'dashboard', '.next'),
  join(ROOT, 'apps', 'admin', '.next'),
  join(ROOT, '.turbo'),
  join(ROOT, 'apps', 'marketing', '.turbo'),
  join(ROOT, 'apps', 'dashboard', '.turbo'),
  join(ROOT, 'apps', 'admin', '.turbo'),
  join(ROOT, 'packages', 'ui', '.turbo'),
  join(ROOT, 'packages', 'utils', '.turbo'),
];

let removed = 0;

for (const target of TARGETS) {
  if (!existsSync(target)) continue;
  rmSync(target, { recursive: true, force: true });
  console.log(`removed ${target.replace(ROOT, '.')}`);
  removed += 1;
}

console.log(removed > 0 ? `\nOK: cleaned ${removed} cache path(s)` : '\nOK: nothing to clean');
