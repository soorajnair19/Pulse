import type { ContributionLevel } from "@/types";

export type GitHubContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export type GitHubContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel: GitHubContributionLevel;
};

export type GitHubContributionWeek = {
  firstDay: string;
  contributionDays: GitHubContributionDay[];
};

export type GitHubContributionCalendar = {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
};

export type GitHubRepoLanguage = {
  name: string;
  color: string | null;
};

export type GitHubCommitContributionsByRepository = {
  contributions: { totalCount: number };
  repository: {
    name: string;
    nameWithOwner: string;
    url: string;
    stargazerCount: number;
    primaryLanguage: GitHubRepoLanguage | null;
  } | null;
};

export type GitHubUserResponse = {
  login: string;
  name: string | null;
  avatarUrl: string;
  followers: { totalCount: number };
  repositories: { totalCount: number };
  contributionsCollection: {
    contributionCalendar: GitHubContributionCalendar;
    commitContributionsByRepository: GitHubCommitContributionsByRepository[];
  };
};

export type GitHubGraphQLResponse = {
  data?: {
    user: GitHubUserResponse | null;
  };
  errors?: Array<{ type?: string; message: string }>;
};

export const LEVEL_MAP: Record<GitHubContributionLevel, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export { ProviderError } from "@/lib/provider-error";
