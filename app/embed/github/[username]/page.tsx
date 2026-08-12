import { fetchContributions, ProviderError } from "@/providers/github";
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
    title: `${username} · GitHub Contributions · Pulse`,
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
    case "MISSING_TOKEN":
      return {
        title: "Configuration error",
        message: "GitHub token is missing or invalid.",
      };
    case "RATE_LIMITED":
      return {
        title: "Rate limit exceeded",
        message: "GitHub API rate limit hit. Try again later.",
      };
    case "NETWORK_ERROR":
      return {
        title: "Network error",
        message: "Could not reach GitHub. Please try again.",
      };
    default:
      return {
        title: "Something went wrong",
        message: error.message,
      };
  }
}

export default async function GitHubEmbedPage({
  params,
  searchParams,
}: PageProps) {
  const { username } = await params;
  const query = await searchParams;

  const variant = parseVariant(query.variant);
  const period = parsePeriod(query.period);
  const visualization = parseVisualization(query.visualization, "github");
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
    const data = await fetchContributions(username, period);

    return (
      <GitHubContributionWidget
        data={data}
        options={{
          variant,
          themeId: theme.id,
          visualization,
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
      <ThemeProvider themeId={theme.id} className="h-full w-full">
        <EmptyState title={copy.title} message={copy.message} />
      </ThemeProvider>
    );
  }
}
