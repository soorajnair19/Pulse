import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { LETTERBOXD_ORIGIN } from "./constants";
import type {
  LetterboxdDiaryEntry,
  LetterboxdPageParseResult,
} from "./types";

type CheerioAPI = cheerio.CheerioAPI;
type CheerioEl = cheerio.Cheerio<Element>;

function absoluteUrl(href: string | undefined | null): string | null {
  if (!href) return null;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("/")) return `${LETTERBOXD_ORIGIN}${href}`;
  return `${LETTERBOXD_ORIGIN}/${href}`;
}

function parseDateFromHref(href: string | undefined | null): string | null {
  if (!href) return null;
  const match = href.match(
    /\/films\/diary\/for\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/?/
  );
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseRating($row: CheerioEl): number | null {
  const meta = $row
    .find('meta[itemprop="ratingValue"], meta[itemprop="rating"]')
    .first();
  const metaContent = meta.attr("content");
  if (metaContent) {
    const numeric = Number.parseFloat(metaContent);
    if (!Number.isNaN(numeric)) {
      if (numeric > 5) return numeric / 2;
      return numeric;
    }
  }

  const ratedClass = $row
    .find("[class*='rated-']")
    .attr("class")
    ?.split(/\s+/)
    .find((c) => /^rated-\d+$/.test(c));
  if (ratedClass) {
    const value = Number.parseInt(ratedClass.replace("rated-", ""), 10);
    if (!Number.isNaN(value) && value > 0) return value / 2;
  }

  const ratingText = $row.find(".rating").first().text().trim();
  if (ratingText) {
    const stars = (ratingText.match(/★/g) ?? []).length;
    const half = ratingText.includes("½") ? 0.5 : 0;
    if (stars > 0 || half > 0) return stars + half;
  }

  return null;
}

function parseRewatch($row: CheerioEl): boolean {
  const rewatchCell = $row.find("td.td-rewatch").first();
  if (rewatchCell.length === 0) return false;
  return !rewatchCell.hasClass("icon-status-off");
}

function parseLiked($row: CheerioEl): boolean {
  if ($row.find(".icon-liked, .large-liked").length > 0) return true;
  const likeCell = $row.find("td.td-like, td.td-likes").first();
  if (likeCell.length === 0) return false;
  return !likeCell.hasClass("icon-status-off");
}

function parseYear($row: CheerioEl): number | null {
  const text = $row.find("td.td-released").first().text().trim();
  const match = text.match(/\d{4}/);
  if (!match) return null;
  const year = Number.parseInt(match[0], 10);
  return Number.isNaN(year) ? null : year;
}

function parsePoster($row: CheerioEl): string | null {
  const poster = $row.find(".film-poster, .poster, img").first();
  const candidates = [
    poster.attr("data-poster-url"),
    poster.attr("data-image-url"),
    poster.attr("src"),
    poster.find("img").attr("src"),
  ];
  for (const candidate of candidates) {
    const url = absoluteUrl(candidate ?? null);
    if (url && !url.includes("empty-poster") && !url.includes("avatar")) {
      return url.replace(/-0-(\d+)-0-(\d+)-crop/, "-0-150-0-225-crop");
    }
  }
  return null;
}

function parseFilmLink(
  $row: CheerioEl
): { title: string; filmUrl: string } | null {
  const link = $row
    .find("h3.film-title a, h3 a, .headline-2 a, td.td-film-details a")
    .first();
  const title =
    link.text().trim() || $row.find("img[alt]").attr("alt")?.trim();
  const href = link.attr("href");
  if (!title || !href) return null;

  let filmPath = href;
  const filmMatch = href.match(/\/film\/([^/]+)/);
  if (filmMatch) {
    filmPath = `/film/${filmMatch[1]}/`;
  }

  const filmUrl = absoluteUrl(filmPath);
  if (!filmUrl) return null;
  return { title, filmUrl };
}

/**
 * Parse a single Letterboxd diary HTML page into structured entries.
 * Isolated so it can be replaced if an official API becomes available.
 */
export function parseDiaryPage(html: string): LetterboxdPageParseResult {
  const $: CheerioAPI = cheerio.load(html);
  const bodyText = $("body").text().toLowerCase();
  const titleText = $("title").text().toLowerCase();

  const isChallenge =
    titleText.includes("just a moment") ||
    bodyText.includes("performing security verification") ||
    bodyText.includes("checking your browser") ||
    bodyText.includes("cf-browser-verification") ||
    Boolean($("#challenge-form, .cf-browser-verification, #cf-challenge-running").length);

  const notFound =
    titleText.includes("not found") ||
    bodyText.includes("sorry, we can’t find the page") ||
    bodyText.includes("sorry, we can't find the page") ||
    (Boolean($(".error-message, .page-error").length) &&
      !$("#diary-table, .diary-table").length);

  const isPrivate =
    bodyText.includes("this account is private") ||
    bodyText.includes("profile is private") ||
    bodyText.includes("you’ll need to be invited") ||
    bodyText.includes("you'll need to be invited");

  const displayName =
    $(".profile-name, .person-display-name, .title-3").first().text().trim() ||
    null;
  const avatarUrl = absoluteUrl(
    $(".profile-avatar img, .avatar img, img.avatar").first().attr("src") ??
      null
  );

  const entries: LetterboxdDiaryEntry[] = [];
  const rows = $("tr.diary-entry-row, table#diary-table tbody tr").toArray();

  for (const row of rows) {
    const $row = $(row);
    if ($row.find("th").length) continue;

    const film = parseFilmLink($row);
    if (!film) continue;

    const dateHref =
      $row
        .find(
          "td.td-day a, td.diary-day a, a[href*='/films/diary/for/']"
        )
        .first()
        .attr("href") ?? null;
    const date = parseDateFromHref(dateHref);
    if (!date) continue;

    entries.push({
      title: film.title,
      date,
      rating: parseRating($row),
      rewatch: parseRewatch($row),
      liked: parseLiked($row),
      filmUrl: film.filmUrl,
      posterUrl: parsePoster($row),
      year: parseYear($row),
    });
  }

  let nextPageUrl: string | null = null;
  const nextLink =
    $(".paginate-nextprev .next, .paginate-next a, a.next")
      .first()
      .attr("href") ??
    $("a.paginate-next").attr("href") ??
    null;
  if (nextLink && !nextLink.includes("disabled")) {
    nextPageUrl = absoluteUrl(nextLink);
  }

  return {
    entries,
    nextPageUrl,
    isPrivate,
    notFound,
    isChallenge,
    displayName,
    avatarUrl,
  };
}

export type LetterboxdRssParseResult = {
  entries: LetterboxdDiaryEntry[];
  notFound: boolean;
  displayName: string | null;
};

/**
 * Parse the public Letterboxd RSS feed (Cheerio/XML).
 * Used as a fallback when HTML diary pages are blocked (e.g. Cloudflare).
 */
export function parseRssFeed(xml: string): LetterboxdRssParseResult {
  const $ = cheerio.load(xml, { xml: true });

  const channelTitle = $("channel > title").first().text().trim();
  if (/not found/i.test(channelTitle) || /not found/i.test($("title").first().text())) {
    return { entries: [], notFound: true, displayName: null };
  }

  // "Letterboxd - username" or "Letterboxd - Display Name"
  let displayName: string | null = null;
  const titleMatch = channelTitle.match(/^Letterboxd\s*-\s*(.+)$/i);
  if (titleMatch) {
    displayName = titleMatch[1].trim();
  }

  const entries: LetterboxdDiaryEntry[] = [];

  $("item").each((_, item) => {
    const $item = $(item);
    const watchedDate = $item.find("letterboxd\\:watchedDate, watchedDate").first().text().trim();
    if (!watchedDate) return; // skip lists / non-diary items

    const title =
      $item.find("letterboxd\\:filmTitle, filmTitle").first().text().trim() ||
      $item.find("title").first().text().replace(/,\s*\d{4}.*$/, "").trim();
    if (!title) return;

    const yearText = $item.find("letterboxd\\:filmYear, filmYear").first().text().trim();
    const year = yearText ? Number.parseInt(yearText, 10) : null;

    const ratingText = $item
      .find("letterboxd\\:memberRating, memberRating")
      .first()
      .text()
      .trim();
    const rating = ratingText ? Number.parseFloat(ratingText) : null;

    const rewatchText = $item
      .find("letterboxd\\:rewatch, rewatch")
      .first()
      .text()
      .trim()
      .toLowerCase();
    const rewatch = rewatchText === "yes" || rewatchText === "true";

    const likeText = $item
      .find("letterboxd\\:memberLike, memberLike")
      .first()
      .text()
      .trim()
      .toLowerCase();
    const liked = likeText === "yes" || likeText === "true";

    const link = $item.find("link").first().text().trim();
    let filmUrl = link;
    const filmMatch = link.match(/\/film\/([^/]+)/);
    if (filmMatch) {
      filmUrl = `${LETTERBOXD_ORIGIN}/film/${filmMatch[1]}/`;
    }

    const description = $item.find("description").first().text();
    const posterMatch = description.match(/src=["']([^"']+)["']/i);
    const posterUrl = posterMatch ? absoluteUrl(posterMatch[1]) : null;

    entries.push({
      title,
      date: watchedDate,
      rating: rating !== null && !Number.isNaN(rating) ? rating : null,
      rewatch,
      liked,
      filmUrl: absoluteUrl(filmUrl) ?? filmUrl,
      posterUrl,
      year: year !== null && !Number.isNaN(year) ? year : null,
    });
  });

  return {
    entries,
    notFound: false,
    displayName,
  };
}

