import type { Anime } from "./types";

export interface CinemetaMeta {
  id: string;
  imdb_id?: string;
  name: string;
  type: "movie" | "series";
  poster?: string;
  background?: string;
  logo?: string;
  description?: string;
  releaseInfo?: string;
  year?: string;
  genres?: string[];
  genre?: string[];
  imdbRating?: string;
  runtime?: string;
  moviedb_id?: number;
  videos?: Array<{
    id: string;
    title?: string;
    name?: string;
    season: number;
    episode?: number;
    number?: number;
    thumbnail?: string;
    overview?: string;
    description?: string;
  }>;
}

function parseNumericId(meta: CinemetaMeta): number {
  if (meta.moviedb_id && !isNaN(meta.moviedb_id)) return meta.moviedb_id;
  const digits = (meta.imdb_id || meta.id).replace(/\D/g, "");
  return parseInt(digits.slice(0, 9), 10) || Math.floor(Math.random() * 1000000);
}

export function toAnimeModel(meta: CinemetaMeta): Anime {
  const rawId = meta.imdb_id || meta.id || "";
  const primaryId = rawId.replace(/^(movie|series)[:_-]/, "");
  const rawGenres = meta.genres || meta.genre || [];
  const score = meta.imdbRating ? Math.round(parseFloat(meta.imdbRating) * 10) : 80;
  const year = parseInt(meta.year || meta.releaseInfo || "2024", 10) || 2024;
  const isMovie = meta.type === "movie";

  const streamingEpisodes = meta.videos?.map((v) => ({
    title: v.name || v.title || `Episode ${v.episode || v.number || 1}`,
    thumbnail: v.thumbnail || meta.background || meta.poster || null,
    season: v.season,
    episode: v.episode || v.number || 1,
  })) ?? [];

  return {
    id: primaryId,
    idMal: primaryId,
    imdbId: primaryId,
    title: {
      english: meta.name,
      romaji: meta.name,
      native: meta.name,
    },
    coverImage: {
      large: meta.poster ?? "",
      extraLarge: meta.poster ?? "",
      color: "#e50914",
    },
    bannerImage: meta.background ?? meta.poster ?? null,
    description: meta.description ?? "",
    episodes: isMovie ? 1 : meta.videos?.length || 10,
    duration: meta.runtime ? parseInt(meta.runtime.replace(/\D/g, ""), 10) || (isMovie ? 115 : 45) : (isMovie ? 115 : 45),
    genres: rawGenres.length > 0 ? rawGenres : [isMovie ? "Movie" : "Series"],
    averageScore: score,
    popularity: 500000,
    format: isMovie ? "MOVIE" : "TV",
    status: isMovie ? "FINISHED" : "RELEASING",
    seasonYear: year,
    streamingEpisodes: streamingEpisodes.length > 0 ? streamingEpisodes : undefined,
  };
}

export async function getCinemetaMovies(genre?: string, limit = 20): Promise<Anime[]> {
  try {
    const url = genre
      ? `https://v3-cinemeta.strem.io/catalog/movie/top/genre=${encodeURIComponent(genre)}.json`
      : `https://v3-cinemeta.strem.io/catalog/movie/top.json`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const metas: CinemetaMeta[] = data?.metas ?? [];
    return metas.slice(0, limit).map(toAnimeModel);
  } catch (e) {
    console.error("Cinemeta movies fetch error:", e);
    return [];
  }
}

export async function getCinemetaSeries(genre?: string, limit = 20): Promise<Anime[]> {
  try {
    const url = genre
      ? `https://v3-cinemeta.strem.io/catalog/series/top/genre=${encodeURIComponent(genre)}.json`
      : `https://v3-cinemeta.strem.io/catalog/series/top.json`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const metas: CinemetaMeta[] = data?.metas ?? [];
    return metas.slice(0, limit).map(toAnimeModel);
  } catch (e) {
    console.error("Cinemeta series fetch error:", e);
    return [];
  }
}

export async function getCinemetaDetails(type: "movie" | "series", id: string): Promise<Anime | null> {
  try {
    const res = await fetch(`https://v3-cinemeta.strem.io/meta/${type}/${id}.json`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.meta || !data.meta.name) return null;
    return toAnimeModel(data.meta);
  } catch (e) {
    console.error("Cinemeta detail fetch error:", e);
    return null;
  }
}

export async function searchCinemeta(query: string, limit = 8): Promise<Anime[]> {
  try {
    const q = query.trim();
    if (!q) return [];
    const [moviesRes, seriesRes] = await Promise.all([
      fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(q)}.json`, {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(6000),
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`https://v3-cinemeta.strem.io/catalog/series/top/search=${encodeURIComponent(q)}.json`, {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(6000),
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);

    const movies: CinemetaMeta[] = moviesRes?.metas ?? [];
    const series: CinemetaMeta[] = seriesRes?.metas ?? [];

    const combined: Anime[] = [];
    const max = Math.max(movies.length, series.length);
    for (let i = 0; i < max && combined.length < limit; i++) {
      if (movies[i]) combined.push(toAnimeModel(movies[i]));
      if (series[i] && combined.length < limit) combined.push(toAnimeModel(series[i]));
    }
    return combined;
  } catch (e) {
    console.error("Cinemeta search error:", e);
    return [];
  }
}

export async function findCinemetaItem(id: string): Promise<Anime | null> {
  const cleanId = id.replace(/^(movie|series)[:_-]/, "");
  const isExplicitSeries = id.startsWith("series");
  const isExplicitMovie = id.startsWith("movie");

  if (isExplicitSeries) {
    const s = await getCinemetaDetails("series", cleanId);
    if (s) return s;
  }
  if (isExplicitMovie) {
    const m = await getCinemetaDetails("movie", cleanId);
    if (m) return m;
  }

  // Check both in parallel
  const [seriesMeta, movieMeta] = await Promise.all([
    getCinemetaDetails("series", cleanId),
    getCinemetaDetails("movie", cleanId),
  ]);

  if (seriesMeta && (seriesMeta.streamingEpisodes?.length || 0) > 0) {
    return seriesMeta;
  }
  if (movieMeta) return movieMeta;
  if (seriesMeta) return seriesMeta;
  return null;
}
