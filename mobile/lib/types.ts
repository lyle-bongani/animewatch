export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC";

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export interface AnimeTitle {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

export interface AnimeCover {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface NextAiringEpisode {
  episode: number;
  timeUntilAiring: number;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCover;
  bannerImage?: string;
  description?: string;
  format?: MediaFormat;
  status?: MediaStatus;
  episodes?: number;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  trending?: number;
  genres: string[];
  isAdult?: boolean;
  countryOfOrigin?: string;
  seasonYear?: number;
  nextAiringEpisode?: NextAiringEpisode;
}

export interface AsuraSeriesCard {
  slug: string;
  title: string;
  cover: string;
  latestChapter?: string;
  rating?: string;
}

export interface AsuraChapter {
  number: string;
  title?: string;
  url: string;
  publishedAt?: string;
}

export interface AsuraComicDetail {
  slug: string;
  title: string;
  cover: string;
  banner?: string;
  synopsis: string;
  status: string;
  genres: string[];
  chapters: AsuraChapter[];
}

export interface AsuraChapterData {
  slug: string;
  chapter: string;
  title?: string;
  seriesTitle?: string;
  pages: string[];
  prevChapter?: string | null;
  nextChapter?: string | null;
}

export interface WatchlistItem {
  id: string | number;
  type: "anime" | "manga";
  title: string;
  cover: string;
  progress?: string;
  total?: string;
  updatedAt: number;
}

export interface WatchHistoryItem {
  id: string | number;
  type: "anime" | "manga";
  title: string;
  cover: string;
  currentEpisodeOrChapter: string;
  watchedAt: number;
}

export function displayTitle(anime: Anime): string {
  return (
    anime.title.english ||
    anime.title.romaji ||
    anime.title.userPreferred ||
    anime.title.native ||
    "Untitled"
  );
}

export function formatLabel(format?: MediaFormat): string {
  switch (format) {
    case "TV":
      return "TV Series";
    case "TV_SHORT":
      return "TV Short";
    case "MOVIE":
      return "Movie";
    case "SPECIAL":
      return "Special";
    case "OVA":
      return "OVA";
    case "ONA":
      return "ONA";
    case "MUSIC":
      return "Music";
    default:
      return "Anime";
  }
}

export function isStraight18(anime: Anime): boolean {
  if (anime.isAdult) return true;
  const lowerGenres = (anime.genres || []).map((g) => g.toLowerCase());
  return lowerGenres.includes("hentai") || lowerGenres.includes("erotica");
}
