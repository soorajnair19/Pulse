export type LetterboxdDiaryEntry = {
  title: string;
  date: string;
  rating: number | null;
  rewatch: boolean;
  filmUrl: string;
  posterUrl: string | null;
  year: number | null;
};

export type LetterboxdPageParseResult = {
  entries: LetterboxdDiaryEntry[];
  nextPageUrl: string | null;
  isPrivate: boolean;
  notFound: boolean;
  isChallenge: boolean;
  displayName: string | null;
  avatarUrl: string | null;
};
