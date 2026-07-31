/**
 * Provider-owned cache helper. Each provider can pass its own revalidate
 * duration; PulseGrid defaults to 24 hours when omitted.
 */
export const DEFAULT_CACHE_REVALIDATE = 86_400;

export function cacheControlHeader(revalidateSeconds: number): string {
  return `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=${revalidateSeconds}`;
}

export function nextFetchCache(revalidateSeconds: number): {
  next: { revalidate: number };
} {
  return { next: { revalidate: revalidateSeconds } };
}
