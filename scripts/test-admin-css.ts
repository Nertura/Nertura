#!/usr/bin/env tsx
/**
 * Admin CSS smoke test — pnpm test:admin-css
 * Verifies http://localhost:3002 serves compiled Tailwind CSS (not raw @tailwind).
 */
const BASE = process.env.ADMIN_TEST_URL ?? 'http://localhost:3002';

const REQUIRED_UTILITIES = [
  '.flex',
  '.grid',
  '.rounded-lg',
  '.bg-background',
  '.bg-void',
  '.font-semibold',
  '.min-h-screen',
] as const;

async function fetchPage(path: string, follow = true) {
  const res = await fetch(`${BASE}${path}`, { redirect: follow ? 'follow' : 'manual' });
  return { path, html: await res.text(), status: res.status };
}

function extractStylesheetHrefs(html: string): string[] {
  const matches = [...html.matchAll(/href="(\/_next\/static\/css\/[^"]+\.css[^"]*)"/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

async function fetchCss(href: string) {
  const res = await fetch(`${BASE}${href}`);
  return { status: res.status, body: await res.text(), contentType: res.headers.get('content-type') };
}

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

async function findValidCss(html: string) {
  const hrefs = extractStylesheetHrefs(html);
  if (!hrefs.length) fail('/login HTML has no stylesheet link');

  for (const href of hrefs) {
    const css = await fetchCss(href);
    if (css.status === 200 && css.body.length >= 10_000 && css.contentType?.includes('text/css')) {
      return { href, body: css.body };
    }
  }

  fail(`No valid CSS among ${hrefs.length} stylesheet link(s): ${hrefs.join(', ')}`);
}

async function main() {
  console.log(`Admin CSS smoke test → ${BASE}`);

  const login = await fetchPage('/login');
  if (login.status !== 200) fail(`/login returned ${login.status}, expected 200`);

  const cssHref = extractStylesheetHrefs(login.html);
  const { href: cssHrefUsed, body: cssBody } = await findValidCss(login.html);

  console.log(`  stylesheet: ${cssHrefUsed} (candidates: ${cssHref.length})`);

  if (cssBody.length < 10_000) fail(`CSS too small (${cssBody.length} bytes)`);
  if (cssBody.includes('@tailwind')) fail('CSS contains raw @tailwind directives');
  if (!cssBody.includes('tailwindcss')) fail('CSS missing tailwindcss banner');

  for (const utility of REQUIRED_UTILITIES) {
    if (!cssBody.includes(utility)) fail(`CSS missing utility ${utility}`);
  }

  if (!login.html.includes('class="') || !login.html.includes('flex')) {
    fail('/login HTML missing Tailwind class attributes');
  }

  console.log('PASS: Admin CSS pipeline healthy');
  console.log(`  CSS size: ${cssBody.length} bytes`);
  console.log(`  utilities: ${REQUIRED_UTILITIES.join(', ')}`);
  console.log(`  /login status: ${login.status}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
