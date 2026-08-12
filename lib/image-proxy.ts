/**
 * Rewrite third-party image URLs through our same-origin proxy.
 * Keeps display working and allows PNG export (CORS-safe).
 */
export function proxiedImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return undefined;
    // Already same-origin / relative — leave alone.
    if (
      typeof window !== "undefined" &&
      parsed.origin === window.location.origin
    ) {
      return url;
    }
  } catch {
    return undefined;
  }
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
