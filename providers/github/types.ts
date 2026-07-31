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

export type GitHubUserResponse = {
  login: string;
  name: string | null;
  avatarUrl: string;
  followers: { totalCount: number };
  repositories: { totalCount: number };
  contributionsCollection: {
    contributionCalendar: GitHubContributionCalendar;
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

export class ProviderError extends Error {
  readonly code:
    | "USER_NOT_FOUND"
    | "MISSING_TOKEN"
    | "RATE_LIMITED"
    | "NETWORK_ERROR"
    | "UNKNOWN";
  readonly status: number;

  constructor(
    code:
      | "USER_NOT_FOUND"
      | "MISSING_TOKEN"
      | "RATE_LIMITED"
      | "NETWORK_ERROR"
      | "UNKNOWN",
    message: string,
    status: number
  ) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.status = status;
  }
}
