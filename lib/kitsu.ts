import type { Anime } from "./types";

export interface KitsuAnimeItem {
  id: string;
  type: string;
  attributes: {
    createdAt?: string;
    slug?: string;
    synopsis?: string;
    description?: string;
    titles?: {
      en?: string;
      en_jp?: string;
      en_us?: string;
      ja_jp?: string;
    };
    canonicalTitle: string;
    averageRating?: string;
    userCount?: number;
    startDate?: string;
    subtype?: string;
    status?: string;
    posterImage?: {
      tiny?: string;
      small?: string;
      medium?: string;
      large?: string;
      original?: string;
    };
    coverImage?: {
      tiny?: string;
      small?: string;
      large?: string;
      original?: string;
    };
    episodeCount?: number;
    episodeLength?: number;
    youtubeVideoId?: string;
  };
}

export function kitsuToAnimeModel(item: KitsuAnimeItem, malId?: number | string, genres?: string[]): Anime {
  const attrs = item.attributes;
  const numId = parseInt(item.id, 10) || Math.floor(Math.random() * 1000000);
  const score = attrs.averageRating ? Math.round(parseFloat(attrs.averageRating)) : 82;
  const year = attrs.startDate ? parseInt(attrs.startDate.split("-")[0], 10) || 2024 : 2024;
  const isMovie = attrs.subtype?.toLowerCase() === "movie";
  const epCount = attrs.episodeCount || (isMovie ? 1 : 12);

  const titleEnglish = attrs.titles?.en || attrs.titles?.en_us || attrs.canonicalTitle;
  const titleRomaji = attrs.titles?.en_jp || attrs.canonicalTitle;
  const titleNative = attrs.titles?.ja_jp || null;

  const poster = attrs.posterImage?.large || attrs.posterImage?.original || attrs.posterImage?.medium || "";
  const banner = attrs.coverImage?.original || attrs.coverImage?.large || poster || null;

  return {
    id: numId,
    idMal: malId || numId,
    title: {
      english: titleEnglish,
      romaji: titleRomaji,
      native: titleNative,
    },
    coverImage: {
      large: poster,
      extraLarge: attrs.posterImage?.original || poster,
      color: "#e50914",
    },
    bannerImage: banner,
    description: attrs.synopsis || attrs.description || "",
    episodes: epCount,
    duration: attrs.episodeLength || (isMovie ? 110 : 24),
    genres: genres && genres.length > 0 ? genres : ["Anime", isMovie ? "Movie" : "Series"],
    averageScore: score,
    popularity: attrs.userCount || 100000,
    format: isMovie ? "MOVIE" : (attrs.subtype?.toUpperCase() || "TV"),
    status: attrs.status === "current" ? "RELEASING" : "FINISHED",
    seasonYear: year,
    trailer: attrs.youtubeVideoId ? { id: attrs.youtubeVideoId, site: "youtube" } : null,
  };
}

export async function getKitsuTrending(limit = 24): Promise<Anime[]> {
  try {
    const res = await fetch(`https://kitsu.io/api/edge/trending/anime?limit=${limit}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: KitsuAnimeItem[] = data?.data ?? [];
    return items.map((i) => kitsuToAnimeModel(i));
  } catch (err) {
    console.error("Kitsu trending fetch error:", err);
    return [];
  }
}

export async function getKitsuPopular(limit = 24): Promise<Anime[]> {
  try {
    const res = await fetch(`https://kitsu.io/api/edge/anime?sort=-userCount&page[limit]=${limit}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: KitsuAnimeItem[] = data?.data ?? [];
    return items.map((i) => kitsuToAnimeModel(i));
  } catch (err) {
    console.error("Kitsu popular fetch error:", err);
    return [];
  }
}

export async function getKitsuTopRated(limit = 24): Promise<Anime[]> {
  try {
    const res = await fetch(`https://kitsu.io/api/edge/anime?sort=-averageRating&page[limit]=${limit}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: KitsuAnimeItem[] = data?.data ?? [];
    return items.map((i) => kitsuToAnimeModel(i));
  } catch (err) {
    console.error("Kitsu top rated fetch error:", err);
    return [];
  }
}

export async function getKitsuAiring(limit = 24): Promise<Anime[]> {
  try {
    const res = await fetch(
      `https://kitsu.io/api/edge/anime?filter[status]=current&sort=-userCount&page[limit]=${limit}`,
      {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: KitsuAnimeItem[] = data?.data ?? [];
    return items.map((i) => kitsuToAnimeModel(i));
  } catch (err) {
    console.error("Kitsu airing fetch error:", err);
    return [];
  }
}

export async function getKitsuNewReleases(limit = 24): Promise<Anime[]> {
  try {
    const res = await fetch(`https://kitsu.io/api/edge/anime?sort=-startDate&page[limit]=${limit}`, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: KitsuAnimeItem[] = data?.data ?? [];
    return items.map((i) => kitsuToAnimeModel(i));
  } catch (err) {
    console.error("Kitsu new releases fetch error:", err);
    return [];
  }
}

export async function searchKitsu(query: string, limit = 12): Promise<Anime[]> {
  try {
    const q = query.trim();
    if (!q) return [];
    const res = await fetch(
      `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(q)}&page[limit]=${limit}`,
      {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: KitsuAnimeItem[] = data?.data ?? [];
    return items.map((i) => kitsuToAnimeModel(i));
  } catch (err) {
    console.error("Kitsu search fetch error:", err);
    return [];
  }
}

export async function getKitsuAnime(id: number | string): Promise<Anime | null> {
  try {
    const res = await fetch(`https://kitsu.io/api/edge/anime/${id}?include=categories,mappings`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.data) return null;

    const categories = data.included
      ?.filter((x: { type: string; attributes?: { title?: string } }) => x.type === "categories")
      .map((c: { attributes?: { title?: string } }) => c.attributes?.title)
      .filter(Boolean) as string[];

    const malMapping = data.included?.find(
      (x: { type: string; attributes?: { externalSite?: string; externalId?: string } }) =>
        x.type === "mappings" && x.attributes?.externalSite === "myanimelist/anime"
    );
    const malId = malMapping?.attributes?.externalId ? parseInt(malMapping.attributes.externalId, 10) : undefined;

    return kitsuToAnimeModel(data.data, malId, categories);
  } catch (err) {
    console.error("Kitsu detail fetch error:", err);
    return null;
  }
}

export async function getKitsuByGenre(genre: string, limit = 24): Promise<Anime[]> {
  try {
    const formatted = genre.toLowerCase().replace(/\s+/g, "-");
    const res = await fetch(
      `https://kitsu.io/api/edge/anime?filter[categories]=${encodeURIComponent(formatted)}&sort=-userCount&page[limit]=${limit}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: KitsuAnimeItem[] = data?.data ?? [];
    return items.map((i) => kitsuToAnimeModel(i, undefined, [genre]));
  } catch (err) {
    console.error(`Kitsu genre fetch error (${genre}):`, err);
    return [];
  }
}
