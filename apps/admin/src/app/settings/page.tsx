export default function SettingsPage() {
  const isProd = process.env.NODE_ENV === 'production';
  const adminAuthDisabled = process.env.ADMIN_AUTH_DISABLED === 'true';

  const geminiKey = process.env.GEMINI_API_KEY?.trim() ?? '';
  const geminiValid = geminiKey.length >= 20;

  const envItems = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', set: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', set: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', set: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { key: 'ADMIN_AUTH_DISABLED', set: !adminAuthDisabled, note: adminAuthDisabled ? 'ON — disable for production' : 'Off (good)' },
    {
      key: 'GEMINI_API_KEY',
      set: geminiValid,
      note: !geminiKey ? 'Not set' : geminiValid ? `Configured (${geminiKey.slice(0, 4)}…)` : 'Too short',
    },
    { key: 'GEMINI_MODEL', value: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash (default)' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-void">Sistem Ayarları</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Platform configuration — values are never displayed, only set/not-set status.
      </p>

      {isProd && adminAuthDisabled && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Critical: ADMIN_AUTH_DISABLED must not be enabled in production.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Variable</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {envItems.map((item) => (
              <tr key={item.key} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{item.key}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {'value' in item
                    ? item.value
                    : item.set
                      ? ('note' in item && item.note ? item.note : 'Configured')
                      : 'Not set'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Guest limit: 3 · Registered credits: 10 signup bonus · Stripe billing runs on dashboard app
        (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET).
      </p>
    </div>
  );
}
