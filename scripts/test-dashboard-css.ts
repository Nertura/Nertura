#!/usr/bin/env tsx
/**
 * Dashboard CSS smoke test — pnpm test:dashboard-css
 * Verifies http://localhost:3001 serves compiled Tailwind CSS (not raw @tailwind).
 */
const BASE = process.env.DASHBOARD_TEST_URL ?? 'http://localhost:3001';

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

async function fetchPage(path: string, follow = true): Promise<PageCheck> {
  const res = await fetch(`${BASE}${path}`, { redirect: follow ? 'follow' : 'manual' });
  const html = await res.text();
  return { path, html, status: res.status };
}

function extractStylesheetHrefs(html: string): string[] {
  const matches = [...html.matchAll(/href="(\/_next\/static\/css\/[^"]+\.css[^"]*)"/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

async function findValidCss(html: string): Promise<{ href: string; body: string }> {
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
  console.log(`Dashboard CSS smoke test → ${BASE}`);

  // /login is always reachable without auth and uses root layout
  const login = await fetchPage('/login');
  if (login.status !== 200) fail(`/login returned ${login.status}, expected 200`);

  const cssHref = extractStylesheetHrefs(login.html);
  const { href: cssHrefUsed, body: cssBody } = await findValidCss(login.html);

  console.log(`  stylesheet: ${cssHrefUsed} (candidates: ${cssHref.length})`);

  const css = { status: 200, body: cssBody, contentType: 'text/css' };
  if (!css.contentType?.includes('text/css')) fail(`CSS Content-Type is ${css.contentType}, expected text/css`);
  if (css.body.length < 10_000) fail(`CSS too small (${css.body.length} bytes) — likely unprocessed`);
  if (css.body.includes('@tailwind')) fail('CSS contains raw @tailwind directives — PostCSS/Tailwind did not run');
  if (!css.body.includes('tailwindcss')) fail('CSS missing tailwindcss banner — not compiled Tailwind output');

  for (const utility of REQUIRED_UTILITIES) {
    if (!css.body.includes(utility)) fail(`CSS missing utility ${utility}`);
  }

  if (!login.html.includes('class="') || !login.html.includes('flex')) {
    fail('/login HTML missing Tailwind class attributes');
  }

  // Root may redirect; follow and ensure final page still has CSS when it renders HTML
  const root = await fetchPage('/');
  if (root.status >= 500) fail(`/ returned ${root.status}`);
  const rootCss = extractStylesheetHrefs(root.html)[0] ?? null;
  if (root.status === 200 && !rootCss) fail('/ HTML has no stylesheet link');

  console.log('PASS: Dashboard CSS pipeline healthy');
  console.log(`  CSS size: ${css.body.length} bytes`);
  console.log(`  utilities: ${REQUIRED_UTILITIES.join(', ')}`);
  console.log(`  /login status: ${login.status}`);
  console.log(`  / status: ${root.status}${rootCss ? ` (css linked)` : ' (redirect)'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
