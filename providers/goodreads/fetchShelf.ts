import { nextFetchCache } from "@/lib/cache";
import { ProviderError } from "@/lib/provider-error";
import {
  CACHE_REVALIDATE,
  FETCH_HEADERS,
  MAX_SHELF_PAGES,
  rssUrl,
  shelfUrl,
} from "./constants";
import { parseRssFeed, parseShelfPage } from "./parseShelf";
import type { GoodreadsShelfEntry } from "./types";

export type FetchedShelf = {
  userId: string;
  entries: GoodreadsShelfEntry[];
  displayName: string | null;
  avatarUrl: string | null;
};

async function fetchText(url: string): Promise<{
  status: number;
  body: string;
}> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: FETCH_HEADERS,
      ...nextFetchCache(CACHE_REVALIDATE),
    });
  } catch {
    throw new ProviderError(
      "NETWORK_ERROR",
      "Failed to reach Goodreads. Please try again later.",
      502
    );
  }

  const body = await response.text();
  return { status: response.status, body };
}

/**
 * Public shelf RSS is the reliable anonymous source (HTML list often requires sign-in).
 * Paginate until a page returns no dated entries.
 */
async function fetchShelfViaRss(userId: string): Promise<FetchedShelf> {
  const allEntries: GoodreadsShelfEntry[] = [];
  let displayName: string | null = null;
  let page = 1;

  while (page <= MAX_SHELF_PAGES) {
    const { status, body } = await fetchText(rssUrl(userId, page));

    if (status === 404) {
      throw new ProviderError(
        "USER_NOT_FOUND",
        `Goodreads user "${userId}" was not found.`,
        404
      );
    }

    if (status >= 500) {
      throw new ProviderError(
        "NETWORK_ERROR",
        `Goodreads returned status ${status}.`,
        502
      );
    }

    const parsed = parseRssFeed(body);

    if (parsed.notFound || (status >= 400 && parsed.entries.length === 0)) {
      if (page === 1 && allEntries.length === 0) {
        throw new ProviderError(
          "USER_NOT_FOUND",
          `Goodreads user "${userId}" was not found.`,
          404
        );
      }
      break;
    }

    if (page === 1) {
      displayName = parsed.displayName;
    }

    if (parsed.entries.length === 0) break;

    allEntries.push(...parsed.entries);

    // Typical page size is 100; a short page means we're at the end.
    if (parsed.entries.length < 100) break;
    page += 1;
  }

  return {
    userId,
    entries: allEntries,
    displayName,
    avatarUrl: null,
  };
}

/**
 * Fetch the public Read shelf for a Goodreads user ID.
 * Tries HTML first; falls back to RSS when HTML is sign-in gated or blocked.
 */
export async function fetchReadShelf(userId: string): Promise<FetchedShelf> {
  const trimmed = userId.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new ProviderError(
      "USER_NOT_FOUND",
      "Goodreads user ID is required.",
      404
    );
  }

  const allEntries: GoodreadsShelfEntry[] = [];
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let page = 1;
  let nextUrl: string | null = shelfUrl(trimmed, 1);
  let htmlBlocked = false;

  while (nextUrl && page <= MAX_SHELF_PAGES) {
    const { status, body: html } = await fetchText(nextUrl);
    const parsed = parseShelfPage(html);

    if (parsed.isChallenge || parsed.requiresSignIn) {
      htmlBlocked = true;
      break;
    }

    if (parsed.isPrivate) {
      throw new ProviderError(
        "PRIVATE_PROFILE",
        `Goodreads profile "${trimmed}" is private.`,
        403
      );
    }

    if (
      (parsed.notFound || status === 404) &&
      page === 1 &&
      parsed.entries.length === 0
    ) {
      throw new ProviderError(
        "USER_NOT_FOUND",
        `Goodreads user "${trimmed}" was not found.`,
        404
      );
    }

    if (status >= 500) {
      throw new ProviderError(
        "NETWORK_ERROR",
        `Goodreads returned status ${status}.`,
        502
      );
    }

    if (status >= 400 && parsed.entries.length === 0 && page === 1) {
      htmlBlocked = true;
      break;
    }

    if (page === 1) {
      displayName = parsed.displayName;
      avatarUrl = parsed.avatarUrl;

      const hasShelfChrome =
        html.includes("bookalike") ||
        html.includes("id=\"books\"") ||
        html.includes("date_read");
      if (
        parsed.entries.length === 0 &&
        !parsed.nextPageUrl &&
        !hasShelfChrome &&
        !parsed.notFound
      ) {
        htmlBlocked = true;
        break;
      }
    }

    allEntries.push(...parsed.entries);
    nextUrl = parsed.nextPageUrl;
    page += 1;
  }

  if (htmlBlocked || allEntries.length === 0) {
    return fetchShelfViaRss(trimmed);
  }

  return {
    userId: trimmed,
    entries: allEntries,
    displayName,
    avatarUrl,
  };
}
