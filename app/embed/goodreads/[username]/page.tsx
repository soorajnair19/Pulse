import { getGoodreadsActivity, ProviderError } from "@/providers/goodreads";
import { GitHubContributionWidget } from "@/components/github/GitHubContributionWidget";
import { ThemeProvider } from "@/components/github/ThemeProvider";
import { EmptyState } from "@/components/shared/EmptyState";
import { getTheme } from "@/lib/themes";
import { parsePeriod } from "@/lib/period";
import {
  parseBooleanParam,
  parseNumberParam,
  parseVariant,
} from "@/lib/utils";
import { parseVisualization } from "@/lib/visualizations";
import type { Metadata } from "next";

/** 24 hours — must be a literal for Next.js segment config. */
export const revalidate = 86400;

const GOODREADS_HEATMAP_ACCENT = "#F4B23E";
const GOODREADS_RATING_ACCENT = "#F4B23E";

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} · Goodreads · Pulse`,
    robots: { index: false, follow: false },
  };
}

function errorCopy(error: ProviderError): { title: string; message: string } {
  switch (error.code) {
    case "USER_NOT_FOUND":
      return {
        title: "User not found",
        message: error.message,
      };
    case "PRIVATE_PROFILE":
      return {
        title: "Profile is private",
        message: error.message,
      };
    case "PARSE_ERROR":
      return {
        title: "Couldn’t read shelf",
        message: error.message,
      };
    case "NETWORK_ERROR":
      return {
        title: "Network error",
        message: "Could not reach Goodreads. Please try again.",
      };
    default:
      return {
        title: "Something went wrong",
        message: error.message,
      };
  }
}

export default async function GoodreadsEmbedPage({
  params,
  searchParams,
}: PageProps) {
  const { username } = await params;
  const query = await searchParams;

  const variant = parseVariant(query.variant);
  const period = parsePeriod(query.period, "goodreads");
  const visualization = parseVisualization(query.visualization, "goodreads");
  const themeId = typeof query.theme === "string" ? query.theme : "github-dark";
  const theme = getTheme(themeId);

  // Finish-date dots use a single bright level — no Less/More scale.
  const showLegend = parseBooleanParam(query.showLegend, false);
  const showMonths = parseBooleanParam(query.showMonths, true);
  const showWeekdays = parseBooleanParam(query.showWeekdays, false);
  const cellSize = parseNumberParam(
    query.cellSize,
    variant === "compact" ? 9 : 11,
    6,
    20
  );
  const gap = parseNumberParam(query.gap, 3, 1, 8);
  const radius = parseNumberParam(query.radius, 2, 0, 8);

  try {
    const data = await getGoodreadsActivity(username, period);

    return (
      <GitHubContributionWidget
        data={data}
        options={{
          variant,
          themeId: theme.id,
          visualization,
          heatmapAccent: GOODREADS_HEATMAP_ACCENT,
          ratingAccent: GOODREADS_RATING_ACCENT,
          showLegend,
          showMonths,
          showWeekdays,
          showStreaks: false,
          cellSize,
          gap,
          radius,
        }}
      />
    );
  } catch (error) {
    const copy =
      error instanceof ProviderError
        ? errorCopy(error)
        : {
            title: "Something went wrong",
            message: "An unexpected error occurred.",
          };

    return (
      <ThemeProvider
        themeId={theme.id}
        className="pulse-embed-root flex h-full min-h-[120px] w-full items-center justify-center"
      >
        <EmptyState title={copy.title} message={copy.message} />
      </ThemeProvider>
    );
  }
}
