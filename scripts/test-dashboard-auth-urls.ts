import {
  containsLocalhostLeak,
  dashboardContextFromRequest,
  getAuthCallbackUrl,
  getDashboardBaseUrl,
  getMarketingBaseUrl,
  resolveAppBaseFromRequest,
  resolveRequestOrigin,
  sanitizeInternalPath,
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

console.log('Dashboard auth URL tests\n');

const LAN = { hostname: '192.168.1.104', protocol: 'http:' as const };
const LOCAL = { hostname: 'localhost', protocol: 'http:' as const };

test('localhost dashboard host → OAuth callback localhost', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: undefined }, () => {
    const callback = getAuthCallbackUrl('/doctor', LOCAL);
    assert(callback.startsWith('http://localhost:3001/auth/callback'), callback);
    assert(callback.includes('next=%2Fdoctor'), callback);
  });
});

test('LAN dashboard host → OAuth callback LAN (not localhost)', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: 'http://localhost:3001' }, () => {
    const callback = getAuthCallbackUrl('/doctor', LAN);
    assert(callback.startsWith('http://192.168.1.104:3001/auth/callback'), callback);
    assert(!containsLocalhostLeak(callback, LAN), callback);
  });
});

test('email register redirectTo on LAN', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: 'http://localhost:3001' }, () => {
    const callback = getAuthCallbackUrl('/onboarding', LAN);
    assert(callback.includes('192.168.1.104:3001'), callback);
    assert(!containsLocalhostLeak(callback, LAN), callback);
  });
});

test('forgot password redirectTo on LAN', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: 'http://localhost:3001' }, () => {
    const callback = getAuthCallbackUrl('/reset-password', LAN);
    assert(callback.includes('192.168.1.104:3001'), callback);
    assert(callback.includes('next=%2Freset-password'), callback);
  });
});

test('signout/login redirect origin from request Host', () => {
  const request = new Request('http://192.168.1.104:3001/auth/signout', {
    headers: { host: '192.168.1.104:3001' },
  });
  const origin = resolveRequestOrigin(request);
  assert(origin === 'http://192.168.1.104:3001', origin);
  const login = new URL('/login', origin).toString();
  assert(login === 'http://192.168.1.104:3001/login', login);
});

test('auth callback post-login origin from request', () => {
  const request = new Request('http://192.168.1.104:3001/auth/callback?code=x&next=%2Fdoctor', {
    headers: { host: '192.168.1.104:3001' },
  });
  const origin = resolveRequestOrigin(request);
  const dest = new URL('/doctor', origin).toString();
  assert(dest === 'http://192.168.1.104:3001/doctor', dest);
});

test('next=/doctor preserved in callback URL', () => {
  const callback = getAuthCallbackUrl('/doctor', LAN);
  assert(new URL(callback).searchParams.get('next') === '/doctor', callback);
});

test('next=https://evil.com blocked', () => {
  const callback = getAuthCallbackUrl('https://evil.com', LAN);
  assert(!callback.includes('evil.com'), callback);
  assert(callback.includes('next=%2Fdoctor'), callback);
});

test('next with localhost in path blocked on LAN', () => {
  const blockedPath = sanitizeInternalPath('/localhost-doctor', '/doctor', LAN);
  assert(blockedPath === '/doctor', blockedPath);
  const blockedUrl = sanitizeInternalPath('http://localhost:3001/doctor', '/doctor', LAN);
  assert(blockedUrl === '/doctor', blockedUrl);
});

test('resolveAppBaseFromRequest on LAN', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: 'http://localhost:3001' }, () => {
    const request = new Request('http://192.168.1.104:3001/login', {
      headers: { host: '192.168.1.104:3001' },
    });
    const base = resolveAppBaseFromRequest(request);
    assert(base === 'http://192.168.1.104:3001', base);
  });
});

test('marketing base from LAN dashboard context', () => {
  withEnv({ NEXT_PUBLIC_MARKETING_URL: 'http://localhost:3000' }, () => {
    const marketing = getMarketingBaseUrl(LAN);
    assert(marketing === 'http://192.168.1.104:3000', marketing);
    assert(!containsLocalhostLeak(marketing, LAN), marketing);
  });
});

test('OTP email redirect from request host', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: 'http://localhost:3001' }, () => {
    const request = new Request('http://192.168.1.104:3001/api/auth/otp/send', {
      headers: { host: '192.168.1.104:3001' },
      method: 'POST',
    });
    const ctx = dashboardContextFromRequest(request);
    const callback = getAuthCallbackUrl('/doctor', ctx);
    assert(!containsLocalhostLeak(callback, ctx), callback);
    assert(callback.startsWith('http://192.168.1.104:3001/auth/callback'), callback);
  });
});

test('billing checkout base from request host', () => {
  withEnv({ NEXT_PUBLIC_APP_URL: 'http://localhost:3001' }, () => {
    const request = new Request('http://192.168.1.104:3001/api/billing/checkout', {
      headers: { host: '192.168.1.104:3001' },
      method: 'POST',
    });
    const base = getDashboardBaseUrl(dashboardContextFromRequest(request));
    assert(base === 'http://192.168.1.104:3001', base);
  });
});

console.log(`\nPASS: ${passed} dashboard auth URL tests`);
