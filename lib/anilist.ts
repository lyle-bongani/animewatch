import type { Anime } from "./types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

/** Fields shared by card/listing queries. */
const CARD_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  episodes
  duration
  genres
  averageScore
  popularity
  format
  status
  season
  seasonYear
  isAdult
  nextAiringEpisode { episode airingAt }
`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 3600,
): Promise<T | null> {
  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });

    if (!res.ok) {
      console.error(`AniList HTTP ${res.status}`);
      return null;
    }

    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
      console.error("AniList errors:", json.errors.map((e) => e.message).join("; "));
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.error("AniList request failed:", err);
    return null;
  }
}

type PageResult = { Page: { media: Anime[] } };

async function listBySort(
  sort: string[],
  perPage = 24,
  extra = "",
  revalidate = 3600,
): Promise<Anime[]> {
  const data = await gql<PageResult>(
    `query ($perPage: Int, $sort: [MediaSort]) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: $sort, isAdult: false${extra}) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, sort },
    revalidate,
  );
  return data?.Page.media ?? [];
}

export function getTrending(perPage = 24): Promise<Anime[]> {
  return listBySort(["TRENDING_DESC", "POPULARITY_DESC"], perPage);
}

export function getPopular(perPage = 24): Promise<Anime[]> {
  return listBySort(["POPULARITY_DESC"], perPage);
}

export function getTopRated(perPage = 24): Promise<Anime[]> {
  return listBySort(["SCORE_DESC"], perPage, ", averageScore_greater: 60");
}

/** Currently airing shows, freshest first. Short revalidate so it stays current. */
export function getAiringNow(perPage = 24): Promise<Anime[]> {
  return listBySort(["TRENDING_DESC"], perPage, ", status: RELEASING", 1800);
}

export function getByGenre(genre: string, perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int, $genre: String) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, genre: $genre, sort: POPULARITY_DESC, isAdult: false) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, genre },
  ).then((d) => d?.Page.media ?? []);
}

export function getIsekai(perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, tag: "Isekai", sort: POPULARITY_DESC, isAdult: false) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage },
  ).then((d) => d?.Page.media ?? []);
}

export interface SearchResult {
  media: Anime[];
  hasNextPage: boolean;
  currentPage: number;
}

export interface SearchFilters {
  genres?: string[];
  format?: string;
  status?: string;
  season?: string;
  seasonYear?: number;
  sort?: string[];
}

export async function searchAnime(
  query: string,
  page = 1,
  perPage = 28,
  filters?: SearchFilters,
): Promise<SearchResult> {
  const hasFilters = filters && Object.values(filters).some(v => v !== undefined);
  const searchVal = query.trim() || undefined;

  // Build the sort list. If search value is present and sort is not specified, use SEARCH_MATCH.
  let sortList: string[] = ["POPULARITY_DESC"];
  if (filters?.sort && filters.sort.length > 0) {
    sortList = filters.sort;
  } else if (searchVal) {
    sortList = ["SEARCH_MATCH"];
  }

  const data = await gql<{
    Page: { pageInfo: { hasNextPage: boolean; currentPage: number }; media: Anime[] };
  }>(
    `query ($search: String, $page: Int, $perPage: Int, $genres: [String], $format: MediaFormat, $status: MediaStatus, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage currentPage }
        media(type: ANIME, search: $search, genre_in: $genres, format: $format, status: $status, season: $season, seasonYear: $seasonYear, sort: $sort, isAdult: false) {
          ${CARD_FIELDS}
        }
      }
    }`,
    {
      search: searchVal,
      page,
      perPage,
      genres: filters?.genres && filters.genres.length > 0 ? filters.genres : undefined,
      format: filters?.format || undefined,
      status: filters?.status || undefined,
      season: filters?.season || undefined,
      seasonYear: filters?.seasonYear || undefined,
      sort: sortList,
    },
    300,
  );
  return {
    media: data?.Page.media ?? [],
    hasNextPage: data?.Page.pageInfo.hasNextPage ?? false,
    currentPage: data?.Page.pageInfo.currentPage ?? page,
  };
}

export interface AiringScheduleItem {
  episode: number;
  airingAt: number;
  media: Anime;
}

export async function getRecentlyAired(page = 1, perPage = 20): Promise<AiringScheduleItem[]> {
  const now = Math.floor(Date.now() / 1000);
  const oneWeekAgo = now - 7 * 24 * 3600;

  const data = await gql<{
    Page: {
      airingSchedules: AiringScheduleItem[];
    };
  }>(
    `query ($page: Int, $perPage: Int, $now: Int, $oneWeekAgo: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(airingAt_lesser: $now, airingAt_greater: $oneWeekAgo, sort: TIME_DESC) {
          episode
          airingAt
          media {
            ${CARD_FIELDS}
          }
        }
      }
    }`,
    { page, perPage, now, oneWeekAgo },
    600, // cache for 10 minutes
  );

  return data?.Page.airingSchedules ?? [];
}

/** Full detail for a single anime, including episodes and recommendations. */
export async function getAnime(id: number): Promise<Anime | null> {
  const data = await gql<{ Media: Anime }>(
    `query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${CARD_FIELDS}
        description(asHtml: false)
        studios(isMain: true) { nodes { name } }
        trailer { id site }
        streamingEpisodes { title thumbnail }
        recommendations(perPage: 12, sort: RATING_DESC) {
          nodes {
            mediaRecommendation {
              ${CARD_FIELDS}
            }
          }
        }
      }
    }`,
    { id },
  );
  return data?.Media ?? null;
}

