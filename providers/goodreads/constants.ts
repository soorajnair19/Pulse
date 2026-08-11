export const CACHE_REVALIDATE = 86_400;

export const GOODREADS_ORIGIN = "https://www.goodreads.com";

/** Safety cap to avoid serverless timeouts on large shelves. */
export const MAX_SHELF_PAGES = 50;

export const FETCH_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

export function shelfUrl(userId: string, page = 1): string {
  const params = new URLSearchParams({
    shelf: "read",
    sort: "date_read",
    order: "d",
    per_page: "50",
  });
  if (page > 1) params.set("page", String(page));
  return `${GOODREADS_ORIGIN}/review/list/${encodeURIComponent(userId)}?${params}`;
}

export function rssUrl(userId: string, page = 1): string {
  const params = new URLSearchParams({ shelf: "read" });
  if (page > 1) params.set("page", String(page));
  return `${GOODREADS_ORIGIN}/review/list_rss/${encodeURIComponent(userId)}?${params}`;
}
