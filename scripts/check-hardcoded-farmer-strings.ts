/**
 * Hard string guard — fails CI when banned English phrases appear in farmer-facing UI string literals.
 * Run: pnpm check:i18n
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const SCAN_DIRS = [
  'apps/marketing/src',
  'apps/dashboard/src',
  'packages/ui/src',
].map((p) => path.join(ROOT, p));

const IGNORE_PATH_PARTS = [
  `${path.sep}admin${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}lib${path.sep}i18n${path.sep}`,
  'doctor-ui-copy.ts',
  'dashboard-copy.ts',
  'marketing-copy.ts',
  'auth-copy.ts',
  'ops-copy.ts',
  'field-copy.ts',
  'onboarding-copy.ts',
  'farm-map-copy.ts',
  'doctor-copy.ts',
  'case-copy.ts',
  'evidence-copy.ts',
  'cookie-consent-banner.tsx',
  'cookie-consent.ts',
  'marketing-sections.tsx',
];

const BANNED_PHRASES = [
  'Confidence',
  'Knowledge Bank',
  'SHORT DIAGNOSIS',
  'WHAT TO DO TODAY',
  'WHEN TO UPLOAD A NEW PHOTO',
  'More details',
  'Farm Profile',
  'Similar Cases',
  'Image Analysis',
  'Conversation History',
  'Photo attached',
  'Loading...',
  'What to do today',
  'When to upload a new photo',
  'Short diagnosis',
  'Checking Knowledge Bank',
  'Nertura is analyzing your field',
  'Ask about your crop',
  'Upload photo',
  'Crop management',
  'Field workspace',
  'Patient records',
  'Open history',
  'No recommendations yet',
  'Start with AI Doctor',
  'Premium field reports',
  'Select a field to unlock',
];

function shouldScanFile(filePath: string): boolean {
  if (!/\.(tsx?|jsx?)$/.test(filePath)) return false;
  if (IGNORE_PATH_PARTS.some((part) => filePath.includes(part))) return false;
  if (filePath.includes(`${path.sep}apps${path.sep}admin${path.sep}`)) return false;
  return true;
}

function extractStringLiterals(content: string): Array<{ value: string; line: number }> {
  const results: Array<{ value: string; line: number }> = [];
  const re = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const quote = match[1];
    if (quote === '`' && match[2].includes('${')) continue;
    const value = match[2];
    if (value.length < 3) continue;
    const line = content.slice(0, match.index).split('\n').length;
    results.push({ value, line });
  }
  return results;
}

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (shouldScanFile(full)) out.push(full);
  }
  return out;
}

type Violation = { file: string; phrase: string; line: number; snippet: string };

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations: Violation[] = [];

  for (const { value, line } of extractStringLiterals(content)) {
    for (const phrase of BANNED_PHRASES) {
      if (value.includes(phrase)) {
        violations.push({
          file: path.relative(ROOT, filePath),
          phrase,
          line,
          snippet: value.slice(0, 80),
        });
      }
    }
  }

  return violations;
}

function main(): void {
  const files = SCAN_DIRS.flatMap((d) => walk(d));
  const all = files.flatMap(scanFile);

  console.log('Hardcoded farmer-string guard');
  console.log(`  Scanned ${files.length} files (string literals only)`);

  if (all.length === 0) {
    console.log('PASS: no banned English phrases in farmer-facing UI');
    process.exit(0);
  }

  console.error(`FAIL: ${all.length} banned phrase(s) found:\n`);
  for (const v of all) {
    console.error(`  ${v.file}:${v.line} — "${v.phrase}" in "${v.snippet}"`);
  }
  process.exit(1);
}

main();
