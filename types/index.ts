export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ActivityItem = {
  title: string;
  ratingLabel?: string;
  url?: string;
  liked?: boolean;
  /** Poster / cover image URL (Letterboxd, Goodreads). */
  posterUrl?: string;
  /** ISO date the item was logged / finished (YYYY-MM-DD). */
  date?: string;
  /** Release / publication year when known. */
  year?: number;
  /** Author name (Goodreads). */
  author?: string;
  /** Numeric star rating 1–5 (Goodreads shelf spines). */
  rating?: number;
  /** Page count when known — maps to spine thickness (Goodreads). */
  pageCount?: number;
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

export type RepoLanguage = {
  name: string;
  color: string | null;
};

/** Per-repo commit activity for Orbit (and future) visualizations. */
export type RepoContribution = {
  name: string;
  nameWithOwner: string;
  url: string;
  contributions: number;
  stargazerCount?: number;
  primaryLanguage?: RepoLanguage | null;
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
  /** Stats shown before the primary total (e.g. selected Year). */
  leadingStats?: ActivityStat[];
  /** Extra stats beyond total + streaks (e.g. Average Rating, Rewatches). */
  extraStats?: ActivityStat[];
  /** Repos with commit contributions in the period (GitHub Orbit). */
  repos?: RepoContribution[];
};

export type WidgetVariant = "compact" | "default" | "detailed";

/** Widget body renderer — heatmap is the classic default. */
export type WidgetVisualization =
  | "heatmap"
  | "pulse"
  | "orbit"
  | "filmstrip"
  | "shelf";

/** Rolling lookbacks (GitHub). */
export type RollingPeriod = "1m" | "3m" | "6m" | "1y";

/**
 * Calendar year as a four-digit string (e.g. "2018").
 * Used by Goodreads and Letterboxd. Validated by `isCalendarYearPeriod`.
 */
export type CalendarYearPeriod = string;

/** @deprecated Use CalendarYearPeriod. */
export type GoodreadsYearPeriod = CalendarYearPeriod;

/** Contribution calendar lookback presets. */
export type ContributionPeriod = RollingPeriod | CalendarYearPeriod;

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
