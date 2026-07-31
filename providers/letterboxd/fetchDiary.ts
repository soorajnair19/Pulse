import { nextFetchCache } from "@/lib/cache";
import { ProviderError } from "@/lib/provider-error";
import {
  CACHE_REVALIDATE,
  diaryUrl,
  FETCH_HEADERS,
  MAX_DIARY_PAGES,
  rssUrl,
} from "./constants";
import { parseDiaryPage, parseRssFeed } from "./parseDiary";
import type { LetterboxdDiaryEntry } from "./types";

export type FetchedDiary = {
  username: string;
  entries: LetterboxdDiaryEntry[];
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
      "Failed to reach Letterboxd. Please try again later.",
      502
    );
  }

  const body = await response.text();
  return { status: response.status, body };
}

/**
 * Fallback when HTML diary pages are blocked (Cloudflare).
 * RSS exposes recent diary entries with structured Letterboxd fields.
 */
async function fetchDiaryViaRss(username: string): Promise<FetchedDiary> {
  const { status, body } = await fetchText(rssUrl(username));

  if (status === 404) {
    throw new ProviderError(
      "USER_NOT_FOUND",
      `Letterboxd user "${username}" was not found.`,
      404
    );
  }

  if (status >= 500) {
    throw new ProviderError(
      "NETWORK_ERROR",
      `Letterboxd returned status ${status}.`,
      502
    );
  }

  const parsed = parseRssFeed(body);

  if (parsed.notFound || (status >= 400 && parsed.entries.length === 0)) {
    throw new ProviderError(
      "USER_NOT_FOUND",
      `Letterboxd user "${username}" was not found.`,
      404
    );
  }

  return {
    username,
    entries: parsed.entries,
    displayName: parsed.displayName,
    avatarUrl: null,
  };
}

/**
 * Fetch all public diary pages for a username (HTML only).
 * Parsing is delegated to parseDiary so the scraper can be swapped later.
 * Falls back to the public RSS feed when HTML is blocked.
 */
export async function fetchDiary(username: string): Promise<FetchedDiary> {
  const trimmed = username.trim();
  if (!trimmed) {
    throw new ProviderError(
      "USER_NOT_FOUND",
      "Letterboxd username is required.",
      404
    );
  }

  const allEntries: LetterboxdDiaryEntry[] = [];
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let page = 1;
  let nextUrl: string | null = diaryUrl(trimmed, 1);
  let htmlBlocked = false;

  while (nextUrl && page <= MAX_DIARY_PAGES) {
    const { status, body: html } = await fetchText(nextUrl);
    const parsed = parseDiaryPage(html);

    if (parsed.isChallenge) {
      htmlBlocked = true;
      break;
    }

    if (parsed.isPrivate) {
      throw new ProviderError(
        "PRIVATE_PROFILE",
        `Letterboxd profile "${trimmed}" is private.`,
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
        `Letterboxd user "${trimmed}" was not found.`,
        404
      );
    }

    if (status >= 500) {
      throw new ProviderError(
        "NETWORK_ERROR",
        `Letterboxd returned status ${status}.`,
        502
      );
    }

    if (status >= 400 && parsed.entries.length === 0 && page === 1) {
      // Non-challenge client errors — try RSS before giving up.
      htmlBlocked = true;
      break;
    }

    if (page === 1) {
      displayName = parsed.displayName;
      avatarUrl = parsed.avatarUrl;

      const hasDiaryChrome =
        html.includes("diary-table") ||
        html.includes("diary-entry-row") ||
        html.includes("/films/diary/");
      if (
        parsed.entries.length === 0 &&
        !parsed.nextPageUrl &&
        !hasDiaryChrome &&
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

  if (htmlBlocked && allEntries.length === 0) {
    return fetchDiaryViaRss(trimmed);
  }

  return {
    username: trimmed,
    entries: allEntries,
    displayName,
    avatarUrl,
  };
}
