import { is3D, type Anime } from "./types";

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
  countryOfOrigin
  tags { name }
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
      signal: AbortSignal.timeout(4000),
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
  return getIsekaiBySort(["POPULARITY_DESC"], perPage);
}

export function getIsekaiBySort(sort: string[], perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int, $sort: [MediaSort]) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, tag: "Isekai", sort: $sort, isAdult: false) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, sort },
  ).then((d) => d?.Page.media ?? []);
}

export function getOngoingIsekai(perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, tag: "Isekai", status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
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
  countryOfOrigin?: string;
}

export async function searchAnime(
  query: string,
  page = 1,
  perPage = 28,
  filters?: SearchFilters,
): Promise<SearchResult> {
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
    `query ($search: String, $page: Int, $perPage: Int, $genres: [String], $format: MediaFormat, $status: MediaStatus, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort], $country: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage currentPage }
        media(type: ANIME, search: $search, countryOfOrigin: $country, genre_in: $genres, format: $format, status: $status, season: $season, seasonYear: $seasonYear, sort: $sort, isAdult: false) {
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
      country: filters?.countryOfOrigin || undefined,
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
        characters(perPage: 8, sort: [ROLE, FAVOURITES_DESC]) {
          nodes { name { full } }
        }
        staff(perPage: 8, sort: RELEVANCE) {
          edges { role node { name { full } } }
        }
        relations {
          edges {
            relationType
            node {
              id
              type
              format
              status
              title { romaji english native }
              coverImage { large extraLarge color }
              season
              seasonYear
            }
          }
        }
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

export async function getDonghuaBySort(
  sort: string[],
  perPage = 24,
  filters?: { is3D?: boolean; status?: string }
): Promise<Anime[]> {
  const data = await gql<PageResult>(
    `query ($perPage: Int, $sort: [MediaSort], $status: MediaStatus) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, countryOfOrigin: "CN", sort: $sort, status: $status, isAdult: false) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, sort, status: filters?.status || undefined },
  );
  let results = data?.Page.media ?? [];
  if (filters?.is3D !== undefined) {
    results = results.filter((a) => {
      const is3d = is3D(a);
      return filters.is3D ? is3d : !is3d;
    });
  }
  return results;
}

export const DONGHUA_LIST_IDS = [
  137653, // Renegade Immortal – Xian Ni
  115844, // A Record of Mortal’s Journey to Immortality
  117012, // Swallowed Star – Tunshi Xingkong
  101920, // Soul Land – Douluo Dalu
  102464, // Battle Through the Heavens – Doupo Cangqiong
  117168, // Martial Master – Wu Shen Zhu Zai
  110595, // A Will Eternal – Yi Nian Yong Heng
  105626, // Stellar Transformation – Xing Chen Bian
  103922, // Wan Jie Xian Zong – Fairy Legends
  126391, // Immortality – Yong Sheng
  131929, // Ten Thousand Worlds – Wan Jie Du Zun
  150950, // Apotheosis – Bai Lian Cheng Shen
  168097, // World of Immortals – Chang Sheng Jie
  118201, // Purple River – Zi Chuan
  146409, // Throne of Seal – Shen Yin Wangzuo
  131073, // Against the Gods – Nitian Xie Shen
  159581, // Tales of Demons and Gods – Yao Shen Ji
];

export async function getAnimeByIds(ids: number[]): Promise<Anime[]> {
  const data = await gql<{ Page: { media: Anime[] } }>(
    `query ($ids: [Int]) {
      Page(page: 1, perPage: 50) {
        media(id_in: $ids, type: ANIME) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { ids },
  );
  const media = data?.Page.media ?? [];
  return media.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
}

