import type { Anime } from "./types";

const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FIELDS = `
  id
  title {
    romaji
    english
    native
    userPreferred
  }
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  description(asHtml: false)
  format
  status
  episodes
  duration
  averageScore
  popularity
  trending
  genres
  isAdult
  countryOfOrigin
  seasonYear
  nextAiringEpisode {
    episode
    timeUntilAiring
  }
`;

async function anilistQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  try {
    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      console.warn(`AniList error: HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.data as T;
  } catch (err) {
    console.error("AniList fetch exception:", err);
    return null;
  }
}

export async function getTrending(perPage = 20): Promise<Anime[]> {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: Anime[] } }>(query, { perPage });
  return data?.Page.media || [];
}

export async function getPopular(perPage = 20): Promise<Anime[]> {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: [POPULARITY_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: Anime[] } }>(query, { perPage });
  return data?.Page.media || [];
}

export async function getTopRated(perPage = 20): Promise<Anime[]> {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: [SCORE_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: Anime[] } }>(query, { perPage });
  return data?.Page.media || [];
}

export async function getAiringNow(perPage = 20): Promise<Anime[]> {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, status: RELEASING, sort: [POPULARITY_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: Anime[] } }>(query, { perPage });
  return data?.Page.media || [];
}

export async function getMovies(perPage = 20): Promise<Anime[]> {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, format: MOVIE, sort: [POPULARITY_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: Anime[] } }>(query, { perPage });
  return data?.Page.media || [];
}

export async function getDonghua(is3D?: boolean, perPage = 24): Promise<Anime[]> {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, countryOfOrigin: "CN", sort: [POPULARITY_DESC, TRENDING_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: Anime[] } }>(query, { perPage });
  const allDonghua = data?.Page.media || [];

  if (is3D === undefined) return allDonghua;

  // Filter 3D vs 2D donghua based on tags/genres/description
  return allDonghua.filter((item) => {
    const desc = (item.description || "").toLowerCase();
    const has3D = desc.includes("3d") || desc.includes("cgi") || desc.includes("computer animated");
    return is3D ? has3D : !has3D;
  });
}

export async function getAnimeDetails(id: number): Promise<Anime | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
      }
    }
  `;
  const data = await anilistQuery<{ Media: Anime }>(query, { id });
  return data?.Media || null;
}

export async function searchAnime(
  search?: string,
  genre?: string,
  page = 1,
  perPage = 20
): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int, $search: String, $genre: String) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, search: $search, genre: $genre, sort: [POPULARITY_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const variables: Record<string, unknown> = { page, perPage };
  if (search?.trim()) variables.search = search.trim();
  if (genre?.trim()) variables.genre = genre.trim();

  const data = await anilistQuery<{ Page: { media: Anime[] } }>(query, variables);
  return data?.Page.media || [];
}
