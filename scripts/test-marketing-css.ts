#!/usr/bin/env tsx
/**
 * Marketing CSS smoke test — pnpm test:marketing-css
 * Verifies http://localhost:3000 serves compiled Tailwind CSS (not raw @tailwind).
 */
const BASE = process.env.MARKETING_TEST_URL ?? 'http://localhost:3000';

const REQUIRED_UTILITIES = [
  '.flex',
  '.grid',
  '.rounded-lg',
  '.bg-background',
  '.bg-void',
  '.font-semibold',
  '.min-h-screen',
] as const;

interface PageCheck {
  path: string;
  html: string;
  status: number;
}

async function fetchPage(path: string): Promise<PageCheck> {
  const res = await fetch(`${BASE}${path}`, { redirect: 'follow' });
  const html = await res.text();
  return { path, html, status: res.status };
}

function extractStylesheetHrefs(html: string): string[] {
  const matches = [...html.matchAll(/href="(\/_next\/static\/css\/[^"]+\.css[^"]*)"/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

async function findValidCss(html: string): Promise<{ href: string; body: string }> {
  const hrefs = extractStylesheetHrefs(html);
  if (!hrefs.length) fail('/ HTML has no stylesheet link');

  for (const href of hrefs) {
    const css = await fetchCss(href);
    if (css.status === 200 && css.body.length >= 10_000 && css.contentType?.includes('text/css')) {
      return { href, body: css.body };
    }
  }

  fail(`No valid CSS among ${hrefs.length} stylesheet link(s): ${hrefs.join(', ')}`);
}

async function fetchCss(href: string): Promise<{ status: number; body: string; contentType: string | null }> {
  const res = await fetch(`${BASE}${href}`);
  const body = await res.text();
  return { status: res.status, body, contentType: res.headers.get('content-type') };
}

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

async function main() {
  console.log(`Marketing CSS smoke test → ${BASE}`);

  const home = await fetchPage('/');
  if (home.status !== 200) fail(`/ returned ${home.status}, expected 200`);

  const cssHref = extractStylesheetHrefs(home.html);
  const { href: cssHrefUsed, body: cssBody } = await findValidCss(home.html);

  console.log(`  stylesheet: ${cssHrefUsed} (candidates: ${cssHref.length})`);

  const css = { status: 200, body: cssBody, contentType: 'text/css' };
  if (!css.contentType?.includes('text/css')) fail(`CSS Content-Type is ${css.contentType}, expected text/css`);
  if (css.body.length < 10_000) fail(`CSS too small (${css.body.length} bytes) — likely unprocessed`);
  if (css.body.includes('@tailwind')) fail('CSS contains raw @tailwind directives — PostCSS/Tailwind did not run');
  if (!css.body.includes('tailwindcss')) fail('CSS missing tailwindcss banner — not compiled Tailwind output');

  for (const utility of REQUIRED_UTILITIES) {
    if (!css.body.includes(utility)) fail(`CSS missing utility ${utility}`);
  }

  if (!home.html.includes('class="') || !home.html.includes('flex')) {
    fail('/ HTML missing Tailwind class attributes');
  }

  console.log('PASS: Marketing CSS pipeline healthy');
  console.log(`  CSS size: ${css.body.length} bytes`);
  console.log(`  utilities: ${REQUIRED_UTILITIES.join(', ')}`);
  console.log(`  / status: ${home.status}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
