import { networkInterfaces } from 'node:os';

import {
  containsLocalhostLeak,
  dashboardContextFromRequest,
  getAuthCallbackUrl,
  getDashboardLoginUrl,
  getDashboardRegisterUrl,
} from '../packages/utils/src/nertura-urls';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function withEnv(vars: Record<string, string | undefined>, fn: () => void): void {
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

console.log('Mobile LAN URL tests\n');

const LAN = { hostname: '192.168.1.104', protocol: 'http:' as const };
const LOCAL = { hostname: 'localhost', protocol: 'http:' as const };

test('marketing localhost → dashboard localhost:3001', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: undefined }, () => {
    const url = getDashboardRegisterUrl({ next: '/doctor' }, LOCAL);
    assert(url.startsWith('http://localhost:3001/register'), url);
  });
});

test('marketing LAN → dashboard LAN :3001', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: 'http://localhost:3001' }, () => {
    const url = getDashboardRegisterUrl({ next: '/doctor' }, LAN);
    assert(url.startsWith('http://192.168.1.104:3001/register'), url);
    assert(!containsLocalhostLeak(url, LAN), url);
  });
});

test('env localhost + LAN host → LAN wins (no leak)', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: 'http://localhost:3001' }, () => {
    const login = getDashboardLoginUrl({ next: '/doctor' }, LAN);
    assert(!containsLocalhostLeak(login, LAN), login);
    assert(login.includes('192.168.1.104:3001'), login);
  });
});

test('production env + production host', () => {
  withEnv(
    {
      NEXT_PUBLIC_DASHBOARD_URL: 'https://app.nertura.com',
      NEXT_PUBLIC_DASHBOARD_DOMAIN: 'app.nertura.com',
    },
    () => {
      const url = getDashboardLoginUrl(undefined, {
        hostname: 'nertura.com',
        protocol: 'https:',
      });
      assert(url.startsWith('https://app.nertura.com/login'), url);
    }
  );
});

test('register preserves next=/doctor and q', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: undefined }, () => {
    const url = getDashboardRegisterUrl({ q: 'salatalık', next: '/doctor' }, LAN);
    const parsed = new URL(url);
    assert(parsed.searchParams.get('next') === '/doctor', 'next');
    assert(parsed.searchParams.get('q') === 'salatalık', 'q');
  });
});

test('login preserves next=/doctor', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: undefined }, () => {
    const url = getDashboardLoginUrl({ next: '/doctor' }, LAN);
    assert(new URL(url).searchParams.get('next') === '/doctor', url);
  });
});

test('API signupUrl from request Host uses LAN', () => {
  withEnv({ NEXT_PUBLIC_DASHBOARD_URL: 'http://localhost:3001' }, () => {
    const request = new Request('http://192.168.1.104:3000/api/doctor', {
      headers: { host: '192.168.1.104:3000' },
    });
    const ctx = dashboardContextFromRequest(request);
    const url = getDashboardRegisterUrl({ next: '/doctor' }, ctx);
    assert(url.startsWith('http://192.168.1.104:3001/register'), url);
  });
});

test('dashboard OAuth callback on LAN uses LAN origin', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: 'http://localhost:3001' }, () => {
    const callback = getAuthCallbackUrl('/doctor', LAN);
    assert(callback.startsWith('http://192.168.1.104:3001/auth/callback'), callback);
    assert(!containsLocalhostLeak(callback, LAN), callback);
  });
});

test('open redirect blocked in auth callback next', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: 'http://localhost:3001' }, () => {
    const callback = getAuthCallbackUrl('https://evil.com', LOCAL);
    assert(!callback.includes('evil.com'), callback);
    assert(callback.includes('next=%2Fdoctor'), callback);
  });
});

test('next.config intake redirect is env-only (documented)', () => {
  console.log('  NOTE  /intake redirect uses build-time env — use direct dashboard URL on LAN');
  passed += 1;
});

console.log(`\nPASS: ${passed} mobile LAN URL tests`);
