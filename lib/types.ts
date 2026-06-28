export interface AnimeTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}

export interface CoverImage {
  large?: string | null;
  extraLarge?: string | null;
  color?: string | null;
}

export interface StreamingEpisode {
  title?: string | null;
  thumbnail?: string | null;
}

export interface Anime {
  id: number;
  idMal?: number | null;
  title: AnimeTitle;
  coverImage: CoverImage;
  bannerImage?: string | null;
  description?: string | null;
  episodes?: number | null;
  duration?: number | null;
  genres: string[];
  averageScore?: number | null;
  popularity?: number | null;
  format?: string | null;
  status?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  isAdult?: boolean;
  studios?: { nodes: { name: string }[] };
  nextAiringEpisode?: { episode: number; airingAt: number } | null;
  trailer?: { id: string | null; site: string | null } | null;
  streamingEpisodes?: StreamingEpisode[];
  recommendations?: {
    nodes: { mediaRecommendation: Anime | null }[];
  };
}

/** Preferred display title: English, then Romaji, then Native. */
export function displayTitle(a: Pick<Anime, "title">): string {
  return a.title.english || a.title.romaji || a.title.native || "Untitled";
}

/** Strip AniList HTML description down to plain text. */
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Best estimate of how many episodes are watchable right now. */
export function watchableEpisodes(a: Pick<Anime, "episodes" | "nextAiringEpisode">): number {
  if (a.nextAiringEpisode?.episode) return Math.max(1, a.nextAiringEpisode.episode - 1);
  if (a.episodes && a.episodes > 0) return a.episodes;
  return 1;
}

/** Human-friendly format label (TV, Movie, OVA…). */
export function formatLabel(format?: string | null): string {
  if (!format) return "";
  const map: Record<string, string> = {
    TV: "TV",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
  };
  return map[format] ?? format;
}
