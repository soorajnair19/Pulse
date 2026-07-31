export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ActivityItem = {
  title: string;
  ratingLabel?: string;
  url?: string;
  liked?: boolean;
};

export type ActivityStat = {
  label: string;
  value: string | number;
};

export type CountNoun = {
  singular: string;
  plural: string;
};

export type ContributionDay = {
  date: string;
  count: number;
  level: ContributionLevel;
  items?: ActivityItem[];
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
  /** Primary stats label — defaults to "Contributions". */
  totalLabel?: string;
  /** Tooltip/count copy — defaults to contribution(s). */
  countNoun?: CountNoun;
  /** Extra stats beyond total + streaks (e.g. Average Rating, Rewatches). */
  extraStats?: ActivityStat[];
};

export type WidgetVariant = "compact" | "default" | "detailed";

/** Contribution calendar lookback presets. */
export type ContributionPeriod = "1m" | "3m" | "6m" | "1y";

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
  | "PRIVATE_PROFILE"
  | "PARSE_ERROR"
  | "UNKNOWN";

export type ApiErrorBody = {
  error: ProviderErrorCode;
  message: string;
};
