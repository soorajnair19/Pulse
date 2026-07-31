/** Provider-owned cache TTL: 24 hours. */
export const CACHE_REVALIDATE = 86_400;

export const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export const CONTRIBUTION_QUERY = `
  query ContributionCalendar($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      login
      name
      avatarUrl
      followers {
        totalCount
      }
      repositories(privacy: PUBLIC) {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            firstDay
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;
