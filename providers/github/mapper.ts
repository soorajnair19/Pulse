import { computeStreaks } from "@/lib/streaks";
import type {
  ContributionData,
  ContributionDay,
  ContributionWeek,
  RepoContribution,
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

function mapRepos(user: GitHubUserResponse): RepoContribution[] {
  const rows =
    user.contributionsCollection.commitContributionsByRepository ?? [];

  return rows
    .filter(
      (row): row is typeof row & { repository: NonNullable<typeof row.repository> } =>
        row.repository != null && row.contributions.totalCount > 0
    )
    .map((row) => ({
      name: row.repository.name,
      nameWithOwner: row.repository.nameWithOwner,
      url: row.repository.url,
      contributions: row.contributions.totalCount,
      stargazerCount: row.repository.stargazerCount,
      primaryLanguage: row.repository.primaryLanguage,
    }))
    .sort((a, b) => b.contributions - a.contributions);
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
    repos: mapRepos(user),
  };
}
