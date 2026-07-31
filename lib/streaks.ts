import type { ContributionDay } from "@/types";

export function computeStreaks(days: ContributionDay[]): {
  currentStreak: number;
  longestStreak: number;
  firstContribution: string | null;
  lastContribution: string | null;
} {
  let longestStreak = 0;
  let running = 0;
  let firstContribution: string | null = null;
  let lastContribution: string | null = null;

  for (const day of days) {
    if (day.count > 0) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
      if (!firstContribution) firstContribution = day.date;
      lastContribution = day.date;
    } else {
      running = 0;
    }
  }

  // Current streak: count consecutive days with activity ending at the most
  // recent day that has data. If today has 0, streak may still count through
  // yesterday (GitHub-style).
  let currentStreak = 0;
  if (days.length > 0) {
    let index = days.length - 1;
    if (days[index].count === 0 && index > 0) {
      index -= 1;
    }
    while (index >= 0 && days[index].count > 0) {
      currentStreak += 1;
      index -= 1;
    }
  }

  return {
    currentStreak,
    longestStreak,
    firstContribution,
    lastContribution,
  };
}
