import type {
  ContributionData,
  ContributionDay,
  ContributionWeek,
} from "@/types";
import { LEVEL_MAP, type GitHubUserResponse } from "./types";

function flattenDays(user: GitHubUserResponse): ContributionDay[] {
  return user.contributionsCollection.contributionCalendar.weeks.flatMap(
    (week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVEL_MAP[day.contributionLevel],
      }))
  );
}

function computeStreaks(days: ContributionDay[]): {
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

  // Current streak: count consecutive days with contributions ending at the
  // most recent day that has data. If today has 0, streak may still count
  // through yesterday (GitHub-style).
  let currentStreak = 0;
  if (days.length > 0) {
    let index = days.length - 1;
    // If the latest day has zero contributions, start from the day before
    // (partial day / timezone friendliness).
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

export function mapGitHubUserToContributionData(
  user: GitHubUserResponse
): ContributionData {
  const calendar = user.contributionsCollection.contributionCalendar;
  const days = flattenDays(user);
  const streaks = computeStreaks(days);

  const weeks: ContributionWeek[] = calendar.weeks.map((week) => ({
    firstDay: week.firstDay,
    contributionDays: week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_MAP[day.contributionLevel],
    })),
  }));

  return {
    username: user.login,
    totalContributions: calendar.totalContributions,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    firstContribution: streaks.firstContribution,
    lastContribution: streaks.lastContribution,
    avatarUrl: user.avatarUrl,
    name: user.name,
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    weeks,
  };
}
