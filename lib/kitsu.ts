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
    ageRating?: string;
    ageRatingGuide?: string;
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
    isAdult: attrs.ageRating === "R18",
    trailer: attrs.youtubeVideoId ? { id: attrs.youtubeVideoId, site: "youtube" } : null,
  };
}

export async function getKitsuTrending(limit = 20): Promise<Anime[]> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 20);
    const res = await fetch(`https://kitsu.io/api/edge/trending/anime?limit=${safeLimit}`, {
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

export async function getKitsuPopular(limit = 20): Promise<Anime[]> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 20);
    const res = await fetch(`https://kitsu.io/api/edge/anime?sort=-userCount&page[limit]=${safeLimit}`, {
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

export async function getKitsuTopRated(limit = 20): Promise<Anime[]> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 20);
    const res = await fetch(`https://kitsu.io/api/edge/anime?sort=-averageRating&page[limit]=${safeLimit}`, {
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

export async function getKitsuAiring(limit = 20): Promise<Anime[]> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 20);
    const res = await fetch(
      `https://kitsu.io/api/edge/anime?filter[status]=current&sort=-userCount&page[limit]=${safeLimit}`,
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

export async function getKitsuNewReleases(limit = 20): Promise<Anime[]> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 20);
    const res = await fetch(`https://kitsu.io/api/edge/anime?sort=-startDate&page[limit]=${safeLimit}`, {
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
    const safeLimit = Math.min(Math.max(1, limit), 20);
    const res = await fetch(
      `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(q)}&page[limit]=${safeLimit}`,
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
    // 1. Direct Kitsu ID lookup
    const res = await fetch(`https://kitsu.io/api/edge/anime/${id}?include=categories,mappings`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
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
      }
    }

    // 2. Mapping fallback for AniList ID
    try {
      const anilistMapRes = await fetch(
        `https://kitsu.io/api/edge/mappings?filter[externalSite]=anilist/anime&filter[externalId]=${id}&include=item`,
        { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) }
      );
      if (anilistMapRes.ok) {
        const mapData = await anilistMapRes.json();
        const item = mapData.included?.find((x: { type: string }) => x.type === "anime");
        if (item) {
          return kitsuToAnimeModel(item, id);
        }
      }
    } catch {
      /* ignore */
    }

    // 3. Mapping fallback for MyAnimeList ID
    try {
      const malMapRes = await fetch(
        `https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/anime&filter[externalId]=${id}&include=item`,
        { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) }
      );
      if (malMapRes.ok) {
        const malData = await malMapRes.json();
        const item = malData.included?.find((x: { type: string }) => x.type === "anime");
        if (item) {
          return kitsuToAnimeModel(item, id);
        }
      }
    } catch {
      /* ignore */
    }

    return null;
  } catch (err) {
    console.error("Kitsu detail fetch error:", err);
    return null;
  }
}

const KITSU_GENRE_MAP: Record<string, string> = {
  "Action": "action",
  "Adventure": "adventure",
  "Aliens": "alien",
  "Anthro": "anthropomorphism",
  "Avant Garde": "dementia",
  "Award Winning": "award-winning",
  "Boys Love": "shounen-ai",
  "Cars": "motorsport",
  "Comedy": "comedy",
  "Cooking": "cooking",
  "Crime": "crime",
  "Cultivation": "martial-arts",
  "Cyberpunk": "cyberpunk",
  "Delinquents": "delinquents",
  "Dementia": "dementia",
  "Demons": "demon",
  "Detective": "detective",
  "Donghua": "donghua",
  "Drama": "drama",
  "Ecchi": "ecchi",
  "Erotica": "erotica",
  "Family": "family",
  "Fantasy": "fantasy",
  "Game": "video-game",
  "Gender Bender": "gender-bender",
  "Girls Love": "shoujo-ai",
  "Gothic": "vampire",
  "Gourmet": "cooking",
  "Harem": "harem",
  "Healing": "slice-of-life",
  "Historical": "historical",
  "Horror": "horror",
  "Idols": "idol",
  "Isekai": "isekai",
  "Iyashikei": "slice-of-life",
  "Josei": "josei",
  "Kids": "kids",
  "Magic": "magic",
  "Magical Girl": "magical-girl",
  "Martial Arts": "martial-arts",
  "Mature": "mature",
  "Mecha": "mecha",
  "Medical": "medical",
  "Military": "military",
  "Monsters": "monster",
  "Music": "music",
  "Mystery": "mystery",
  "Mythology": "mythology",
  "Otaku": "otaku",
  "Parody": "parody",
  "Performing Arts": "the-arts",
  "Police": "cops",
  "Post-Apocalyptic": "post-apocalypse",
  "Psychological": "psychological",
  "Racing": "motorsport",
  "Reincarnation": "reincarnation",
  "Reverse Harem": "reverse-harem",
  "Romance": "romance",
  "Samurai": "samurai",
  "School": "school-life",
  "Sci-Fi": "science-fiction",
  "Seinen": "seinen",
  "Shoujo": "shoujo",
  "Shounen": "shounen",
  "Slice of Life": "slice-of-life",
  "Space": "space",
  "Sports": "sports",
  "Super Power": "super-power",
  "Superhero": "super-power",
  "Supernatural": "supernatural",
  "Survival": "survival",
  "Suspense": "suspense",
  "Swordplay": "swordplay",
  "Time Travel": "time-travel",
  "Thriller": "thriller",
  "Urban Fantasy": "contemporary-fantasy",
  "Vampire": "vampire",
  "Video Game": "virtual-reality",
  "Virtual Reality": "virtual-reality",
  "War": "war",
  "Workplace": "working-life",
  "Wuxia": "martial-arts",
  "Xianxia": "martial-arts",
  "Yaoi": "yaoi",
  "Yuri": "yuri",
  "Zombies": "zombie",
};

export async function getKitsuByGenre(genre: string, limit = 20, offset = 0): Promise<Anime[]> {
  try {
    const mapped = KITSU_GENRE_MAP[genre] || genre.toLowerCase().replace(/\s+/g, "-");
    const safeLimit = Math.min(Math.max(1, limit), 20);
    const res = await fetch(
      `https://kitsu.io/api/edge/anime?filter[categories]=${encodeURIComponent(mapped)}&sort=-userCount&page[limit]=${safeLimit}&page[offset]=${offset}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    let items: KitsuAnimeItem[] = data?.data ?? [];
    if (items.length === 0 && offset === 0) {
      // Fallback to text query if category returned 0
      const textRes = await fetch(
        `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(genre)}&sort=-userCount&page[limit]=${safeLimit}`,
        { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
      );
      if (textRes.ok) {
        const textData = await textRes.json();
        items = textData?.data ?? [];
      }
    }
    return items.map((i) => kitsuToAnimeModel(i, undefined, [genre]));
  } catch (err) {
    console.error(`Kitsu genre fetch error (${genre}):`, err);
    return [];
  }
}
