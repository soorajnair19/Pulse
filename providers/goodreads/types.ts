export type GoodreadsShelfEntry = {
  title: string;
  date: string;
  rating: number | null;
  bookUrl: string;
  author: string | null;
  coverUrl: string | null;
};

export type GoodreadsPageParseResult = {
  entries: GoodreadsShelfEntry[];
  nextPageUrl: string | null;
  isPrivate: boolean;
  notFound: boolean;
  isChallenge: boolean;
  requiresSignIn: boolean;
  displayName: string | null;
  avatarUrl: string | null;
};
