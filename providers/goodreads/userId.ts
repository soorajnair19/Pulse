/**
 * Extract a numeric Goodreads user ID from raw digits or a profile/shelf URL.
 * Examples:
 * - "24555957"
 * - "https://www.goodreads.com/review/list/24555957?ref=nav_mybooks"
 * - "https://www.goodreads.com/user/show/24555957-sooraj"
 */
export function parseGoodreadsUserId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`
    );
    if (!/(^|\.)goodreads\.com$/i.test(url.hostname)) return null;

    const listMatch = url.pathname.match(/\/review\/list\/(\d+)/i);
    if (listMatch) return listMatch[1];

    const showMatch = url.pathname.match(/\/user\/show\/(\d+)/i);
    if (showMatch) return showMatch[1];

    const rssMatch = url.pathname.match(/\/review\/list_rss\/(\d+)/i);
    if (rssMatch) return rssMatch[1];
  } catch {
    return null;
  }

  return null;
}

export function isValidGoodreadsUserId(id: string): boolean {
  return /^\d{1,12}$/.test(id);
}
