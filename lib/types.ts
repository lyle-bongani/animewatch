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
  characters?: { nodes: { name: { full: string | null } }[] };
  staff?: { edges: { role: string | null; node: { name: { full: string | null } } }[] };
  recommendations?: {
    nodes: { mediaRecommendation: Anime | null }[];
  };
  countryOfOrigin?: string | null;
  tags?: { name: string }[];
  relations?: {
    edges: {
      relationType: string;
      node: {
        id: number;
        type: string;
        format: string;
        status: string;
        title: AnimeTitle;
        coverImage?: CoverImage;
      };
    }[];
  };
}

/** Preferred display title: English, then Romaji, then Native. */
export function displayTitle(a: Pick<Anime, "title">): string {
  return a.title.english || a.title.romaji || a.title.native || "Untitled";
}

/** Detect if a Chinese anime/donghua is 3D CGI or traditionally 2D. */
export function is3D(a: Anime): boolean {
  if (!a.tags) return false;
  return a.tags.some((t) => {
    const name = t.name.toLowerCase();
    return name.includes("cgi") || name === "3d" || name.includes("3d cgi") || name === "computer-animated" || name.includes("3d cg");
  });
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

/**
 * Personalized-style "% Match" badge (green on Netflix). We don't have a taste
 * profile, so we surface AniList's average score (already 0–100) as the match.
 */
export function matchPercent(a: Pick<Anime, "averageScore">): number | null {
  if (!a.averageScore) return null;
  return Math.min(99, Math.max(50, a.averageScore));
}

/** Maturity rating chip, mirroring Netflix's bordered maturity tag. */
export function maturityLabel(a: Pick<Anime, "isAdult" | "genres">): string {
  if (a.isAdult) return "18+";
  const mature = ["Ecchi", "Horror", "Thriller", "Psychological"];
  if (a.genres?.some((g) => mature.includes(g))) return "16+";
  return "13+";
}

/** Director name from the AniList staff edges, if present. */
export function directorName(a: Pick<Anime, "staff">): string | null {
  const edge = a.staff?.edges.find((e) => (e.role ?? "").toLowerCase().includes("director"));
  return edge?.node.name.full ?? null;
}

/** Main cast / character names. */
export function castNames(a: Pick<Anime, "characters">, limit = 4): string[] {
  return (
    a.characters?.nodes
      .map((n) => n.name.full)
      .filter((n): n is string => !!n)
      .slice(0, limit) ?? []
  );
}
