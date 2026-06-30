/**
 * Marketing dashboard URL resolution — unit tests (no browser).
 * Run: pnpm test:marketing-urls
 */

import {
  buildDashboardUrl,
  getDashboardBaseUrl,
  getDashboardLoginUrl,
  getDashboardRegisterUrl,
  isLocalHostname,
  isPrivateLanHostname,
} from '../packages/utils/src/nertura-urls';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function withEnv(
  vars: Record<string, string | undefined>,
  fn: () => void
): void {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    const value = vars[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    fn();
  } finally {
    for (const key of Object.keys(vars)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

let passed = 0;

function test(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  OK  ${name}`);
}

console.log('Marketing dashboard URL tests\n');

test('localhost browser → localhost:3001', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: undefined }, () => {
    const base = getDashboardBaseUrl({ hostname: 'localhost', protocol: 'http:' });
    assert(base === 'http://localhost:3001', `expected localhost:3001, got ${base}`);
  });
});

test('LAN browser 192.168.1.102 → same host :3001 (ignores env localhost)', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: 'http://localhost:3001' }, () => {
    const base = getDashboardBaseUrl({ hostname: '192.168.1.102', protocol: 'http:' });
    assert(
      base === 'http://192.168.1.102:3001',
      `expected LAN dashboard, got ${base}`
    );
  });
});

test('env production URL on public host', () => {
  withEnv(
    {
      NEXT_PUBLIC_DASHBOARD_URL: 'https://app.nertura.com',
      NEXT_PUBLIC_DASHBOARD_DOMAIN: 'app.nertura.com',
    },
    () => {
      const base = getDashboardBaseUrl({
        hostname: 'nertura.com',
        protocol: 'https:',
      });
      assert(base === 'https://app.nertura.com', `expected production, got ${base}`);
    }
  );
});

test('register URL preserves q param', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: undefined }, () => {
    const url = getDashboardRegisterUrl(
      { q: 'domates lekeleri', next: '/doctor' },
      { hostname: '192.168.1.102', protocol: 'http:' }
    );
    const parsed = new URL(url);
    assert(parsed.pathname === '/register', `path ${parsed.pathname}`);
    assert(parsed.searchParams.get('q') === 'domates lekeleri', 'missing q');
    assert(parsed.searchParams.get('next') === '/doctor', 'missing next');
    assert(parsed.origin === 'http://192.168.1.102:3001', `origin ${parsed.origin}`);
  });
});

test('login URL preserves next param', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: undefined }, () => {
    const url = getDashboardLoginUrl(
      { next: '/doctor' },
      { hostname: '192.168.1.102', protocol: 'http:' }
    );
    const parsed = new URL(url);
    assert(parsed.pathname === '/login', `path ${parsed.pathname}`);
    assert(parsed.searchParams.get('next') === '/doctor', 'missing next');
  });
});

test('isPrivateLanHostname detects 192.168.x.x', () => {
  assert(isPrivateLanHostname('192.168.1.102'), '192.168 should be LAN');
  assert(!isLocalHostname('192.168.1.102'), '192.168 is not localhost');
});

test('buildDashboardUrl doctor with conversation', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: 'http://localhost:3001' }, () => {
    const url = buildDashboardUrl(
      '/doctor',
      { conversation: 'abc-123' },
      { hostname: 'localhost', protocol: 'http:' }
    );
    assert(url.includes('conversation=abc-123'), url);
  });
});

console.log(`\nPASS: ${passed} marketing URL tests`);
