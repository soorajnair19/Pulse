import { nextFetchCache } from "@/lib/cache";
import { getPeriodRange, parsePeriod } from "@/lib/period";
import type { ContributionData, ContributionPeriod } from "@/types";
import {
  CACHE_REVALIDATE,
  CONTRIBUTION_QUERY,
  GITHUB_GRAPHQL_URL,
} from "./constants";
import { mapGitHubUserToContributionData } from "./mapper";
import {
  ProviderError,
  type GitHubGraphQLResponse,
} from "./types";

export async function fetchContributions(
  username: string,
  period: ContributionPeriod = "1y"
): Promise<ContributionData> {
  const token = process.env.GITHUB_TOKEN;
  const resolvedPeriod = parsePeriod(period);
  const { from, to } = getPeriodRange(resolvedPeriod);

  if (!token) {
    throw new ProviderError(
      "MISSING_TOKEN",
      "GitHub token is not configured. Set GITHUB_TOKEN in your environment.",
      401
    );
  }

  let response: Response;

  try {
    response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "PulseGrid-Widget",
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { username, from, to },
      }),
      ...nextFetchCache(CACHE_REVALIDATE),
    });
  } catch {
    throw new ProviderError(
      "NETWORK_ERROR",
      "Failed to reach the GitHub API. Please try again later.",
      502
    );
  }

  if (response.status === 401) {
    throw new ProviderError(
      "MISSING_TOKEN",
      "GitHub token is invalid or expired.",
      401
    );
  }

  if (response.status === 403 || response.status === 429) {
    throw new ProviderError(
      "RATE_LIMITED",
      "GitHub API rate limit exceeded. Please try again later.",
      429
    );
  }

  if (!response.ok) {
    throw new ProviderError(
      "NETWORK_ERROR",
      `GitHub API returned status ${response.status}.`,
      502
    );
  }

  const payload = (await response.json()) as GitHubGraphQLResponse;

  if (payload.errors?.length) {
    const notFound = payload.errors.some(
      (error) =>
        error.type === "NOT_FOUND" ||
        /could not resolve|not found/i.test(error.message)
    );
    if (notFound || payload.data?.user === null) {
      throw new ProviderError(
        "USER_NOT_FOUND",
        `GitHub user "${username}" was not found.`,
        404
      );
    }

    throw new ProviderError(
      "UNKNOWN",
      payload.errors[0]?.message ?? "Unknown GitHub GraphQL error.",
      502
    );
  }

  if (!payload.data?.user) {
    throw new ProviderError(
      "USER_NOT_FOUND",
      `GitHub user "${username}" was not found.`,
      404
    );
  }

  return mapGitHubUserToContributionData(payload.data.user);
}
