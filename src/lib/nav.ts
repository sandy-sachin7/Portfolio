// Query URL helpers — F1. Every CAREER.DB state is a shareable query.
// Hash-based so no server is involved: #q=<encoded query>.

const PREFIX = '#q=';

/** Serialize a query string to a shareable hash. */
export function encodeQueryUrl(query: string): string {
  return `${PREFIX}${encodeURIComponent(query.trim())}`;
}

/** Parse a location hash back to a query string. Null when not a query URL. */
export function decodeQueryUrl(hash: string): string | null {
  if (!hash.startsWith(PREFIX)) return null;
  try {
    const query = decodeURIComponent(hash.slice(PREFIX.length)).trim();
    return query.length > 0 ? query : null;
  } catch {
    return null;
  }
}
