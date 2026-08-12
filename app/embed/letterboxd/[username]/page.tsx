import { getLetterboxdActivity, ProviderError } from "@/providers/letterboxd";
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
    title: `${username} · Letterboxd Diary · Pulse`,
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
        title: "Couldn’t read diary",
        message: error.message,
      };
    case "NETWORK_ERROR":
      return {
        title: "Network error",
        message: "Could not reach Letterboxd. Please try again.",
      };
    default:
      return {
        title: "Something went wrong",
        message: error.message,
      };
  }
}

export default async function LetterboxdEmbedPage({
  params,
  searchParams,
}: PageProps) {
  const { username } = await params;
  const query = await searchParams;

  const variant = parseVariant(query.variant);
  const period = parsePeriod(query.period, "letterboxd");
  const visualization = parseVisualization(query.visualization, "letterboxd");
  const themeId = typeof query.theme === "string" ? query.theme : "github-dark";
  const theme = getTheme(themeId);

  const showLegend = parseBooleanParam(
    query.showLegend,
    variant !== "compact"
  );
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
    const data = await getLetterboxdActivity(username, period);

    return (
      <GitHubContributionWidget
        data={data}
        options={{
          variant,
          themeId: theme.id,
          visualization,
          heatmapAccent: "#FF8001",
          ratingAccent: "#00E054",
          showLegend,
          showMonths,
          showWeekdays,
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
        heatmapAccent="#FF8001"
        className="h-full w-full"
      >
        <EmptyState title={copy.title} message={copy.message} />
      </ThemeProvider>
    );
  }
}
