import { networkInterfaces } from 'node:os';

function detectLanIp(): string {
  const nets = networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const entry of entries ?? []) {
      if (entry.family !== 'IPv4' || entry.internal) continue;
      if (
        entry.address.startsWith('192.168.') ||
        entry.address.startsWith('10.') ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(entry.address)
      ) {
        return entry.address;
      }
    }
  }
  return '127.0.0.1';
}

const lan = detectLanIp();

console.log('\nNertura mobile LAN dev\n');
console.log('Run each in a separate terminal (after pnpm clean:next if caches are stale):\n');
console.log('  pnpm dev:mobile:marketing');
console.log('  pnpm dev:mobile:dashboard');
console.log('  pnpm dev:mobile:admin\n');
console.log('LAN URLs (same Wi‑Fi as iPhone):\n');
console.log(`  Marketing:  http://${lan}:3000`);
console.log(`  Dashboard:  http://${lan}:3001`);
console.log(`  Admin:      http://${lan}:3002\n`);
console.log('iPhone QA:');
console.log(`  1. Open http://${lan}:3000`);
console.log(`  2. Tap Ücretsiz hesap oluştur → http://${lan}:3001/register?next=%2Fdoctor`);
console.log(`  3. Tap Giriş yap → http://${lan}:3001/login?next=%2Fdoctor\n`);
console.log('Tip: unset NEXT_PUBLIC_DASHBOARD_URL in apps/marketing/.env.local for LAN auto-detect,');
console.log('     or set NEXT_PUBLIC_DASHBOARD_URL=http://' + lan + ':3001\n');
console.log('Hosted Supabase (required for Google OAuth on iPhone):');
console.log('  Dashboard → Authentication → URL Configuration → Redirect URLs');
console.log(`  Add: http://${lan}:3001/auth/callback`);
console.log(`  Add: http://${lan}:3001/**`);
console.log('  Without this, OAuth falls back to Site URL (often localhost) and breaks on iPhone.\n');
