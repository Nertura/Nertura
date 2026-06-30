const MIN_MAPBOX_TOKEN_LENGTH = 8;

/** Read Mapbox token — direct process.env for Next.js client inlining. */
export function readMapboxAccessToken(): string | undefined {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
  if (!token || token.length < MIN_MAPBOX_TOKEN_LENGTH) return undefined;
  return token;
}

/** Server-safe Mapbox token check — no browser APIs or Mapbox SDK. */
export function isMapboxTokenConfigured(): boolean {
  return readMapboxAccessToken() !== undefined;
}

/** Dev-only diagnostic — never logs the full token. */
export function logMapboxTokenDebug(context: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
  const present = Boolean(token && token.length >= MIN_MAPBOX_TOKEN_LENGTH);
  console.info(`[mapbox] ${context}`, {
    tokenPresent: present,
    tokenPrefix: token ? token.slice(0, 3) : '(none)',
  });
}
