export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type ContributionWeek = {
  firstDay: string;
  contributionDays: ContributionDay[];
};

export type ContributionData = {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  firstContribution: string | null;
  lastContribution: string | null;
  avatarUrl?: string;
  name?: string | null;
  followers?: number;
  publicRepos?: number;
  weeks: ContributionWeek[];
};

export type WidgetVariant = "compact" | "default" | "detailed";

/** Contribution calendar lookback presets. */
export type ContributionPeriod = "3m" | "6m" | "1y";

export type ThemeId =
  | "github-dark"
  | "github-light"
  | "minimal"
  | "glass"
  | "figma"
  | "nord"
  | "dracula"
  | "catppuccin";

export type ProviderErrorCode =
  | "USER_NOT_FOUND"
  | "MISSING_TOKEN"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type ApiErrorBody = {
  error: ProviderErrorCode;
  message: string;
};
