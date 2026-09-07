import type { Anime } from "./types";

const MAL_CLIENT_ID =
  process.env.MAL_CLIENT_ID || "f964474b9d17e82a1f0229c781f28afc";

const MAL_FIELDS =
  "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,studios,pictures,background,related_anime,recommendations";

export interface MalAnimeNode {
  id: number;
  title: string;
  main_picture?: {
    medium?: string;
    large?: string;
  };
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
  start_date?: string;
  end_date?: string;
  synopsis?: string;
  mean?: number;
  rank?: number;
  popularity?: number;
  num_list_users?: number;
  num_scoring_users?: number;
  nsfw?: string;
  media_type?: string;
  status?: string;
  genres?: Array<{ id: number; name: string }>;
  num_episodes?: number;
  start_season?: {
    year: number;
    season: string;
  };
  broadcast?: {
    day_of_the_week?: string;
    start_time?: string;
  };
  source?: string;
  average_episode_duration?: number;
  rating?: string;
  studios?: Array<{ id: number; name: string }>;
  pictures?: Array<{ medium?: string; large?: string }>;
  background?: string;
  related_anime?: Array<{
    node: { id: number; title: string; main_picture?: { medium?: string; large?: string } };
    relation_type_formatted: string;
  }>;
  recommendations?: Array<{
    node: { id: number; title: string; main_picture?: { medium?: string; large?: string } };
    num_recommendations?: number;
  }>;
}

export function malToAnimeModel(node: MalAnimeNode): Anime {
  const isMovie = node.media_type === "movie";
  const numId = node.id;
  const poster =
    node.main_picture?.large || node.main_picture?.medium || "";
  const banner =
    (node.pictures && node.pictures.length > 1
      ? node.pictures[1]?.large
      : node.pictures?.[0]?.large) ||
    poster ||
    null;

  const titleEnglish =
    node.alternative_titles?.en || node.title;
  const titleRomaji = node.title;
  const titleNative = node.alternative_titles?.ja || null;

  const score = node.mean ? Math.round(node.mean * 10) : 80;
  const year =
    node.start_season?.year ||
    (node.start_date ? parseInt(node.start_date.split("-")[0], 10) : 2024) ||
    2024;

  const genresList =
    node.genres && node.genres.length > 0
      ? node.genres.map((g) => g.name)
      : ["Anime", isMovie ? "Movie" : "Series"];

  const isAdult =
    node.rating === "rx" ||
    node.rating === "r+" ||
    node.nsfw === "black" ||
    genresList.includes("Hentai") ||
    genresList.includes("Erotica");

  let formatStr = (node.media_type || "tv").toUpperCase();
  if (formatStr === "TV") formatStr = "TV";
  else if (formatStr === "MOVIE") formatStr = "MOVIE";

  let statusStr = "FINISHED";
  if (node.status === "currently_airing") statusStr = "RELEASING";
  else if (node.status === "not_yet_aired") statusStr = "NOT_YET_RELEASED";

  const recs = node.recommendations?.map((r) => ({
    mediaRecommendation: {
      id: r.node.id,
      idMal: r.node.id,
      title: { english: r.node.title, romaji: r.node.title, native: null },
      coverImage: {
        large: r.node.main_picture?.large || r.node.main_picture?.medium || "",
        extraLarge: r.node.main_picture?.large || r.node.main_picture?.medium || "",
        color: "#e50914",
      },
      genres: ["Anime"],
      averageScore: 80,
    } as Anime,
  }));

  return {
    id: numId,
    idMal: numId,
    title: {
      english: titleEnglish,
      romaji: titleRomaji,
      native: titleNative,
    },
    coverImage: {
      large: poster,
      extraLarge: poster,
      color: "#e50914",
    },
    bannerImage: banner,
    description: node.synopsis || "",
    episodes: node.num_episodes || (isMovie ? 1 : 12),
    duration: node.average_episode_duration
      ? Math.round(node.average_episode_duration / 60)
      : isMovie
      ? 110
      : 24,
    genres: genresList,
    averageScore: score,
    popularity: node.num_list_users || node.popularity || 100000,
    format: formatStr,
    status: statusStr,
    season: node.start_season?.season ? node.start_season.season.toUpperCase() : null,
    seasonYear: year,
    isAdult,
    studios: node.studios ? { nodes: node.studios.map((s) => ({ name: s.name })) } : undefined,
    recommendations: recs ? { nodes: recs } : undefined,
  };
}

async function fetchMal<T>(endpoint: string, revalidate = 3600): Promise<T | null> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `https://api.myanimelist.net/v2${endpoint}`;

    const res = await fetch(url, {
      headers: {
        "X-MAL-CLIENT-ID": MAL_CLIENT_ID,
      },
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`MAL API returned HTTP ${res.status} for ${endpoint}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error(`MAL fetch error for ${endpoint}:`, err);
    return null;
  }
}

interface RankingResponse {
  data: Array<{ node: MalAnimeNode }>;
  paging?: { next?: string };
}

interface SearchResponse {
  data: Array<{ node: MalAnimeNode }>;
  paging?: { next?: string };
}

export async function getMalTrending(limit = 24): Promise<Anime[]> {
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const data = await fetchMal<RankingResponse>(
    `/anime/ranking?ranking_type=airing&limit=${safeLimit}&fields=${MAL_FIELDS}`,
    1800
  );
  return data?.data?.map((item) => malToAnimeModel(item.node)) ?? [];
}

export async function getMalPopular(limit = 24): Promise<Anime[]> {
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const data = await fetchMal<RankingResponse>(
    `/anime/ranking?ranking_type=bypopularity&limit=${safeLimit}&fields=${MAL_FIELDS}`,
    3600
  );
  return data?.data?.map((item) => malToAnimeModel(item.node)) ?? [];
}

export async function getMalTopRated(limit = 24): Promise<Anime[]> {
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const data = await fetchMal<RankingResponse>(
    `/anime/ranking?ranking_type=all&limit=${safeLimit}&fields=${MAL_FIELDS}`,
    3600
  );
  return data?.data?.map((item) => malToAnimeModel(item.node)) ?? [];
}

export async function getMalMovies(limit = 24): Promise<Anime[]> {
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const data = await fetchMal<RankingResponse>(
    `/anime/ranking?ranking_type=movie&limit=${safeLimit}&fields=${MAL_FIELDS}`,
    3600
  );
  return data?.data?.map((item) => malToAnimeModel(item.node)) ?? [];
}

export async function getMalSeries(limit = 24): Promise<Anime[]> {
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const data = await fetchMal<RankingResponse>(
    `/anime/ranking?ranking_type=tv&limit=${safeLimit}&fields=${MAL_FIELDS}`,
    3600
  );
  return data?.data?.map((item) => malToAnimeModel(item.node)) ?? [];
}

export async function searchMal(
  query: string,
  limit = 24,
  offset = 0
): Promise<Anime[]> {
  const q = query.trim();
  if (!q) return [];
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const data = await fetchMal<SearchResponse>(
    `/anime?q=${encodeURIComponent(q)}&limit=${safeLimit}&offset=${offset}&nsfw=true&fields=${MAL_FIELDS}`,
    1800
  );
  return data?.data?.map((item) => malToAnimeModel(item.node)) ?? [];
}

export async function getMalAnime(id: number | string): Promise<Anime | null> {
  const numId = typeof id === "number" ? id : parseInt(String(id), 10);
  if (!numId || isNaN(numId)) return null;

  const node = await fetchMal<MalAnimeNode>(
    `/anime/${numId}?fields=${MAL_FIELDS}`,
    86400
  );
  if (!node || !node.id) return null;
  return malToAnimeModel(node);
}

export async function getMalByGenre(
  genre: string,
  limit = 24,
  offset = 0
): Promise<Anime[]> {
  return searchMal(genre, limit, offset);
}
