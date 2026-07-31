import { getPeriodRange } from "@/lib/period";
import { computeStreaks } from "@/lib/streaks";
import type {
  ActivityItem,
  ContributionData,
  ContributionDay,
  ContributionLevel,
  ContributionPeriod,
  ContributionWeek,
} from "@/types";
import type { LetterboxdDiaryEntry } from "./types";

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function countToLevel(count: number): ContributionLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

/** Convert a 0.5–5 rating into a star glyph string (e.g. ★★★★½). */
export function formatStarRating(rating: number): string {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5;
  return `${"★".repeat(full)}${half ? "½" : ""}`;
}

function buildActivityItem(entry: LetterboxdDiaryEntry): ActivityItem {
  return {
    title: entry.title,
    ratingLabel:
      entry.rating !== null ? formatStarRating(entry.rating) : undefined,
    url: entry.filmUrl,
  };
}

function startOfUtcWeek(date: Date): Date {
  const day = date.getUTCDay(); // 0 Sun … 6 Sat
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() - day);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function buildWeeks(
  from: Date,
  to: Date,
  byDate: Map<string, LetterboxdDiaryEntry[]>
): ContributionWeek[] {
  const weeks: ContributionWeek[] = [];
  const cursor = startOfUtcWeek(from);
  const end = startOfUtcWeek(to);

  while (cursor <= end) {
    const firstDay = toDateKey(cursor);
    const contributionDays: ContributionDay[] = [];

    for (let i = 0; i < 7; i += 1) {
      const day = new Date(cursor);
      day.setUTCDate(cursor.getUTCDate() + i);
      const date = toDateKey(day);
      const entries = byDate.get(date) ?? [];
      contributionDays.push({
        date,
        count: entries.length,
        level: countToLevel(entries.length),
        items:
          entries.length > 0 ? entries.map(buildActivityItem) : undefined,
      });
    }

    weeks.push({ firstDay, contributionDays });
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  return weeks;
}

export function mapDiaryToContributionData(
  username: string,
  entries: LetterboxdDiaryEntry[],
  period: ContributionPeriod,
  profile?: { displayName?: string | null; avatarUrl?: string | null }
): ContributionData {
  const { from: fromIso, to: toIso } = getPeriodRange(period);
  const from = new Date(fromIso);
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(toIso);
  to.setUTCHours(0, 0, 0, 0);

  const fromKey = toDateKey(from);
  const toKey = toDateKey(to);

  const inWindow = entries.filter(
    (entry) => entry.date >= fromKey && entry.date <= toKey
  );

  const byDate = new Map<string, LetterboxdDiaryEntry[]>();
  for (const entry of inWindow) {
    const list = byDate.get(entry.date) ?? [];
    list.push(entry);
    byDate.set(entry.date, list);
  }

  const weeks = buildWeeks(from, to, byDate);
  const flatDays = weeks.flatMap((week) => week.contributionDays);
  const streakDays = flatDays.filter(
    (day) => day.date >= fromKey && day.date <= toKey
  );
  const streaks = computeStreaks(streakDays);

  const rated = inWindow.filter(
    (e): e is LetterboxdDiaryEntry & { rating: number } => e.rating !== null
  );
  const averageRating =
    rated.length > 0
      ? rated.reduce((sum, e) => sum + e.rating, 0) / rated.length
      : null;
  const rewatches = inWindow.filter((e) => e.rewatch).length;

  return {
    username,
    totalContributions: inWindow.length,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    firstContribution: streaks.firstContribution,
    lastContribution: streaks.lastContribution,
    avatarUrl: profile?.avatarUrl ?? undefined,
    name: profile?.displayName ?? null,
    weeks,
    totalLabel: "Movies Logged",
    countNoun: {
      singular: "Film Logged",
      plural: "Films Logged",
    },
    extraStats: [
      {
        label: "Average Rating",
        value:
          averageRating !== null ? averageRating.toFixed(1) : "—",
      },
      {
        label: "Rewatches",
        value: rewatches,
      },
    ],
  };
}
