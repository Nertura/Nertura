export interface OAuthProviderStatus {
  google: boolean;
  apple: boolean;
}

function envGoogleEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED?.trim().toLowerCase();
  return flag === 'true' || flag === '1';
}

function envAppleEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_OAUTH_APPLE_ENABLED?.trim().toLowerCase();
  return flag === 'true' || flag === '1';
}

/** Reads enabled OAuth providers from env flags and Supabase GoTrue public settings. */
export async function getOAuthProviderStatus(): Promise<OAuthProviderStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  let googleFromSupabase = false;
  let appleFromSupabase = false;

  if (url && anonKey) {
    try {
      const res = await fetch(`${url}/auth/v1/settings`, {
        headers: {
          apikey: anonKey,
          Accept: 'application/json',
        },
        next: { revalidate: 300 },
      });

      if (res.ok) {
        const data = (await res.json()) as { external?: Record<string, boolean> };
        const external = data.external ?? {};
        googleFromSupabase = Boolean(external.google);
        appleFromSupabase = Boolean(external.apple);
      }
    } catch {
      // fall through to env flags
    }
  }

  return {
    google: envGoogleEnabled() || googleFromSupabase,
    apple: envAppleEnabled() || appleFromSupabase,
  };
}
