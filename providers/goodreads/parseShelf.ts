import * as cheerio from "cheerio";
import { GOODREADS_ORIGIN } from "./constants";
import type {
  GoodreadsPageParseResult,
  GoodreadsShelfEntry,
} from "./types";

function absoluteUrl(href: string | undefined | null): string | null {
  if (!href) return null;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("/")) return `${GOODREADS_ORIGIN}${href}`;
  return `${GOODREADS_ORIGIN}/${href}`;
}

function textContent(value: string | undefined | null): string {
  return (value ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

const MONTH_NAME_TO_NUM: Record<string, string> = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sept: "09",
  sep: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12",
};

/**
 * Normalize a Goodreads finish date to YYYY-MM-DD.
 * Month-only values (e.g. "October 2025") become the 1st of that month.
 */
function parseFinishDate(raw: string | undefined | null): string | null {
  const value = textContent(raw)
    .replace(/^date read:?\s*/i, "")
    .trim();
  if (!value) return null;

  // Description / HTML: "2026/07/10"
  const slashFull = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (slashFull) {
    const [, y, m, d] = slashFull;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Month + year only: "2025/10" → 2025-10-01
  const slashMonth = value.match(/^(\d{4})\/(\d{1,2})$/);
  if (slashMonth) {
    const [, y, m] = slashMonth;
    return `${y}-${m.padStart(2, "0")}-01`;
  }

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];

  // Month + year only: "October 2025", "Oct 2025", "Oct, 2025"
  const monthYear = value.match(
    /^([A-Za-z]+)\.?,?\s+(\d{4})$/
  );
  if (monthYear) {
    const month = MONTH_NAME_TO_NUM[monthYear[1].toLowerCase()];
    if (month) return `${monthYear[2]}-${month}-01`;
  }

  // Full named date: "Jul 10, 2026" / "October 10, 2025"
  const namedFull = value.match(
    /^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/
  );
  if (namedFull) {
    const month = MONTH_NAME_TO_NUM[namedFull[1].toLowerCase()];
    if (month) {
      return `${namedFull[3]}-${month}-${namedFull[2].padStart(2, "0")}`;
    }
  }

  // RSS: "Fri, 10 Jul 2026 00:00:00 +0000"
  const rfc = Date.parse(value);
  if (!Number.isNaN(rfc)) {
    return new Date(rfc).toISOString().slice(0, 10);
  }

  return null;
}

function parseRating(raw: string | undefined | null): number | null {
  const value = textContent(raw);
  if (!value) return null;
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric) || numeric <= 0) return null;
  return Math.min(5, Math.max(1, Math.round(numeric)));
}

function bookUrlFromId(bookId: string | null): string | null {
  if (!bookId) return null;
  return `${GOODREADS_ORIGIN}/book/show/${bookId}`;
}

/**
 * Parse a Goodreads review-list HTML page.
 * Often redirects to sign-in for anonymous requests — callers should fall back to RSS.
 */
export function parseShelfPage(html: string): GoodreadsPageParseResult {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().toLowerCase();
  const titleText = $("title").text().toLowerCase();

  const isChallenge =
    titleText.includes("just a moment") ||
    bodyText.includes("performing security verification") ||
    bodyText.includes("checking your browser") ||
    Boolean(
      $("#challenge-form, .cf-browser-verification, #cf-challenge-running").length
    );

  const requiresSignIn =
    titleText.includes("sign in") ||
    bodyText.includes("sign in to goodreads") ||
    Boolean($("#choices .amazonSignInButton, .authPortalSignInButton").length);

  const notFound =
    titleText.includes("page not found") ||
    bodyText.includes("page not found") ||
    (Boolean($(".errorBox, .errorMessage").length) &&
      !$("#books, table#books, .bookalike").length);

  const isPrivate =
    bodyText.includes("this profile is private") ||
    bodyText.includes("profile is private") ||
    bodyText.includes("only visible to goodreads members");

  const displayName =
    $(".userName, .profileName, h1.username").first().text().trim() || null;
  const avatarUrl = absoluteUrl(
    $(".profilePicture img, .userIcon img, img.profilePicture")
      .first()
      .attr("src") ?? null
  );

  const entries: GoodreadsShelfEntry[] = [];
  const rows = $(
    "tr.bookalike, table#books tbody tr, #booksBody tr, .elementList"
  ).toArray();

  for (const row of rows) {
    const $row = $(row);
    if ($row.find("th").length) continue;

    const titleLink = $row
      .find("a.bookTitle, td.title a, .title a[href*='/book/show/']")
      .first();
    const title =
      titleLink.text().trim() ||
      $row.find("img[alt]").attr("alt")?.trim() ||
      "";
    if (!title) continue;

    const href = titleLink.attr("href") ?? null;
    const bookIdMatch = href?.match(/\/book\/show\/(\d+)/);
    const bookUrl =
      absoluteUrl(href) ??
      bookUrlFromId(bookIdMatch?.[1] ?? null) ??
      GOODREADS_ORIGIN;

    const dateRaw =
      $row.find(".date_read, td.date_read, .dateRead").first().text().trim() ||
      $row.find("[class*='date_read']").first().text().trim() ||
      null;
    const date = parseFinishDate(dateRaw?.replace(/^date read:?/i, "").trim());
    if (!date) continue;

    const rating =
      parseRating(
        $row.find(".staticStars, .rating, [class*='p'][class*='stars']").attr(
          "title"
        ) ?? null
      ) ??
      (() => {
        const stars = $row.find(".staticStars .staticStar.p10").length;
        return stars > 0 ? stars : null;
      })();

    const author =
      $row.find("a.authorName, td.author a, .author a").first().text().trim() ||
      null;
    const coverUrl = absoluteUrl(
      $row.find("img.bookCover, img.bookImage, img").first().attr("src") ?? null
    );

    entries.push({
      title,
      date,
      rating,
      bookUrl,
      author,
      coverUrl,
    });
  }

  let nextPageUrl: string | null = null;
  const nextLink =
    $("a.next_page:not(.disabled), .next_page a, a[rel='next']")
      .first()
      .attr("href") ?? null;
  if (nextLink && !nextLink.includes("disabled")) {
    nextPageUrl = absoluteUrl(nextLink);
  }

  return {
    entries,
    nextPageUrl,
    isPrivate,
    notFound,
    isChallenge,
    requiresSignIn,
    displayName,
    avatarUrl,
  };
}

export type GoodreadsRssParseResult = {
  entries: GoodreadsShelfEntry[];
  notFound: boolean;
  displayName: string | null;
  hasMore: boolean;
};

/**
 * Parse the public Goodreads shelf RSS feed (primary public data source).
 */
export function parseRssFeed(xml: string): GoodreadsRssParseResult {
  const $ = cheerio.load(xml, { xml: true });

  const channelTitle = textContent($("channel > title").first().text());
  if (/not found/i.test(channelTitle) || /page not found/i.test(xml)) {
    return { entries: [], notFound: true, displayName: null, hasMore: false };
  }

  let displayName: string | null = null;
  const titleMatch = channelTitle.match(/^(.+?)'s bookshelf:/i);
  if (titleMatch) {
    displayName = titleMatch[1].trim();
  }

  const entries: GoodreadsShelfEntry[] = [];

  $("item").each((_, item) => {
    const $item = $(item);

    const readAt =
      textContent($item.find("user_read_at").first().text()) ||
      (() => {
        const description = $item.find("description").first().text();
        const match = description.match(
          /read at:\s*([A-Za-z]+\.?,?\s+\d{1,2},?\s+\d{4}|[A-Za-z]+\.?,?\s+\d{4}|\d{4}\/\d{1,2}(?:\/\d{1,2})?)/i
        );
        return match?.[1] ?? "";
      })();

    const date = parseFinishDate(readAt);
    if (!date) return;

    const title = textContent($item.find("title").first().text());
    if (!title) return;

    const bookId = textContent($item.find("book_id").first().text()) || null;
    const link = textContent($item.find("link").first().text());
    const bookUrl =
      bookUrlFromId(bookId) ??
      (() => {
        const fromDesc = $item
          .find("description")
          .first()
          .text()
          .match(/href="(https?:\/\/www\.goodreads\.com\/book\/show\/[^"]+)"/i);
        return fromDesc?.[1] ?? absoluteUrl(link) ?? GOODREADS_ORIGIN;
      })();

    const rating = parseRating($item.find("user_rating").first().text());
    const author =
      textContent($item.find("author_name").first().text()) || null;
    const coverUrl =
      textContent($item.find("book_medium_image_url").first().text()) ||
      textContent($item.find("book_image_url").first().text()) ||
      null;

    entries.push({
      title,
      date,
      rating,
      bookUrl,
      author,
      coverUrl: coverUrl || null,
    });
  });

  return {
    entries,
    notFound: false,
    displayName,
    hasMore: entries.length > 0,
  };
}
