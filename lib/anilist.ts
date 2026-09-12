import { is3D, type Anime } from "./types";
import {
  getKitsuTrending,
  getKitsuPopular,
  getKitsuTopRated,
  getKitsuAiring,
  getKitsuNewReleases,
  getKitsuAnime,
  searchKitsu,
  getKitsuByGenre,
} from "./kitsu";
import {
  getMalTrending,
  getMalPopular,
  getMalTopRated,
  getMalMovies,
  getMalSeries,
  searchMal,
  getMalAnime,
  getMalByGenre,
} from "./mal";

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

// In-memory fallback cache to prevent the site from ever getting stuck if AniList is rate-limited or fails
const memoryCache = new Map<string, unknown>();

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 3600,
): Promise<T | null> {
  const cacheKey = JSON.stringify({ query, variables });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate },
        signal: AbortSignal.timeout(10000),
      });

      if (res.status === 429) {
        console.warn(`AniList rate limited (429) on attempt ${attempt + 1}. Retrying...`);
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
      }

      if (!res.ok) {
        console.error(`AniList HTTP ${res.status}`);
        break;
      }

      const json = (await res.json()) as GraphQLResponse<T>;
      if (json.errors?.length) {
        console.error("AniList errors:", json.errors.map((e) => e.message).join("; "));
        break;
      }

      if (json.data) {
        memoryCache.set(cacheKey, json.data);
        return json.data;
      }
    } catch (err) {
      console.error(`AniList request attempt ${attempt + 1} failed:`, err);
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // Fallback to in-memory cached response if available
  if (memoryCache.has(cacheKey)) {
    console.warn("Returning in-memory cached AniList data for fallback.");
    return memoryCache.get(cacheKey) as T;
  }

  return null;
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
        media(type: ANIME, sort: $sort${extra}) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, sort },
    revalidate,
  );
  const list = data?.Page.media;
  if (!list || list.length === 0) {
    if (extra.includes("RELEASING") || (sort && sort[0] === "START_DATE_DESC")) {
      const mal = await getMalTrending(perPage);
      return mal.length > 0 ? mal : getKitsuAiring(perPage);
    }
    if (sort && sort[0] === "SCORE_DESC") {
      const mal = await getMalTopRated(perPage);
      return mal.length > 0 ? mal : getKitsuTopRated(perPage);
    }
    if (sort && sort[0] === "POPULARITY_DESC") {
      const mal = await getMalPopular(perPage);
      return mal.length > 0 ? mal : getKitsuPopular(perPage);
    }
    const mal = await getMalTrending(perPage);
    return mal.length > 0 ? mal : getKitsuTrending(perPage);
  }
  return list;
}

export function getTrending(perPage = 24): Promise<Anime[]> {
  return listBySort(["TRENDING_DESC", "POPULARITY_DESC"], perPage);
}

export function getPopular(perPage = 24): Promise<Anime[]> {
  return listBySort(["POPULARITY_DESC"], perPage);
}

export function getTopRated(perPage = 24): Promise<Anime[]> {
  return listBySort(["SCORE_DESC"], perPage);
}

/** Currently airing shows, freshest first. Short revalidate so it stays current. */
export function getAiringNow(perPage = 24): Promise<Anime[]> {
  return listBySort(["TRENDING_DESC"], perPage, ", status: RELEASING", 1800);
}

export function getByGenre(genre: string, perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int, $genre: String) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, genre },
  ).then(async (d) => {
    const list = d?.Page.media;
    if (!list || list.length === 0) {
      const mal = await getMalByGenre(genre, perPage);
      return mal.length > 0 ? mal : getKitsuByGenre(genre, perPage);
    }
    return list;
  });
}

export function getIsekai(perPage = 24): Promise<Anime[]> {
  return getIsekaiBySort(["POPULARITY_DESC"], perPage);
}

export function getIsekaiBySort(sort: string[], perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int, $sort: [MediaSort]) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, tag: "Isekai", sort: $sort) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, sort },
  ).then(async (d) => {
    const list = d?.Page.media;
    if (!list || list.length === 0) {
      const mal = await getMalByGenre("isekai", perPage);
      return mal.length > 0 ? mal : getKitsuByGenre("isekai", perPage);
    }
    return list;
  });
}

export function getOngoingIsekai(perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, tag: "Isekai", status: RELEASING, sort: POPULARITY_DESC) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage },
  ).then(async (d) => {
    const list = d?.Page.media;
    if (!list || list.length === 0) {
      const mal = await getMalByGenre("isekai", perPage);
      return mal.length > 0 ? mal : getKitsuByGenre("isekai", perPage);
    }
    return list;
  });
}

export function getMoviesBySort(sort: string[], perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int, $sort: [MediaSort]) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, format: MOVIE, sort: $sort) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, sort },
  ).then(async (d) => {
    const list = d?.Page.media;
    if (!list || list.length === 0) {
      const mal = await getMalMovies(perPage);
      if (mal.length > 0) return mal;
      const live = await searchKitsu("movie", perPage);
      return live.slice(0, perPage);
    }
    return list;
  });
}

export function getSeriesBySort(sort: string[], perPage = 24, status?: string): Promise<Anime[]> {
  const extra = status ? `, status: ${status}` : "";
  return gql<PageResult>(
    `query ($perPage: Int, $sort: [MediaSort]) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, format: TV, sort: $sort${extra}) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage, sort },
  ).then(async (d) => {
    const list = d?.Page.media;
    if (!list || list.length === 0) {
      if (status === "RELEASING") {
        const mal = await getMalTrending(perPage);
        return mal.length > 0 ? mal : getKitsuAiring(perPage);
      }
      const mal = await getMalSeries(perPage);
      return mal.length > 0 ? mal : getKitsuPopular(perPage);
    }
    return list;
  });
}

export function getNewReleases(perPage = 24): Promise<Anime[]> {
  return gql<PageResult>(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: [START_DATE_DESC, POPULARITY_DESC]) {
          ${CARD_FIELDS}
        }
      }
    }`,
    { perPage },
  ).then(async (d) => {
    const list = d?.Page.media;
    if (!list || list.length === 0) {
      const mal = await getMalTrending(perPage);
      return mal.length > 0 ? mal : getKitsuNewReleases(perPage);
    }
    return list;
  });
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
  } else if (filters?.status === "NOT_YET_RELEASED") {
    sortList = ["START_DATE", "POPULARITY_DESC"];
  } else if (filters?.status === "RELEASING") {
    sortList = ["UPDATED_AT_DESC", "TRENDING_DESC"];
  }

  const data = await gql<{
    Page: { pageInfo: { hasNextPage: boolean; currentPage: number }; media: Anime[] };
  }>(
    `query ($search: String, $page: Int, $perPage: Int, $genres: [String], $format: MediaFormat, $status: MediaStatus, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort], $country: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage currentPage }
        media(type: ANIME, search: $search, countryOfOrigin: $country, genre_in: $genres, format: $format, status: $status, season: $season, seasonYear: $seasonYear, sort: $sort) {
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
  const media = data?.Page.media ?? [];
  if (media.length === 0) {
    const offset = (page - 1) * perPage;
    if (searchVal) {
      const malResults = await searchMal(searchVal, perPage, offset);
      if (malResults.length > 0) {
        return {
          media: malResults,
          hasNextPage: malResults.length >= perPage,
          currentPage: page,
        };
      }
      const liveKitsu = await searchKitsu(searchVal, perPage);
      return {
        media: liveKitsu,
        hasNextPage: false,
        currentPage: 1,
      };
    } else if (filters?.genres && filters.genres.length > 0) {
      const malResults = await getMalByGenre(filters.genres[0], perPage, offset);
      if (malResults.length > 0) {
        return {
          media: malResults,
          hasNextPage: malResults.length >= perPage,
          currentPage: page,
        };
      }
      const liveKitsu = await getKitsuByGenre(filters.genres[0], perPage, (page - 1) * Math.min(perPage, 20));
      return {
        media: liveKitsu,
        hasNextPage: liveKitsu.length >= 20,
        currentPage: page,
      };
    }
  }
  return {
    media,
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
export async function getAnime(id: number | string): Promise<Anime | null> {
  const numId = typeof id === "number" ? id : parseInt(String(id), 10);
  if (numId && !isNaN(numId)) {
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
      { id: numId },
    );
    if (data?.Media) return data.Media;

    const mal = await getMalAnime(numId);
    if (mal) return mal;
  }

  return getKitsuAnime(id);
}

export async function getDonghuaBySort(
  sort: string[],
  perPage = 24,
  filters?: { is3D?: boolean; status?: string }
): Promise<Anime[]> {
  const data = await gql<PageResult>(
    `query ($perPage: Int, $sort: [MediaSort], $status: MediaStatus) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, countryOfOrigin: "CN", sort: $sort, status: $status) {
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
  165524, // 100,000 Years of Qi Refining – Lian Qi Shiwan Nian
  137653, // Renegade Immortal – Xian Ni
  120218, // Perfect World – Wanmei Shijie
  137671, // Shrouding the Heavens – Zhe Tian
  115844, // A Record of Mortal’s Journey to Immortality
  117012, // Swallowed Star – Tunshi Xingkong
  101920, // Soul Land – Douluo Dalu
  102464, // Battle Through the Heavens – Doupo Cangqiong
  150950, // Apotheosis – Bai Lian Cheng Shen
  146409, // Throne of Seal – Shen Yin Wangzuo
  131073, // Against the Gods – Nitian Xie Shen
  117168, // Martial Master – Wu Shen Zhu Zai
  110595, // A Will Eternal – Yi Nian Yong Heng
  105626, // Stellar Transformation – Xing Chen Bian
  109009, // Lord of the Universe – Wan Jie Shenzhu
  122521, // Peerless Martial Spirit – Jueshi Wu Hun
  119924, // Supreme God Emperor – Wu Shang Shen Di
  107744, // Martial Universe – Wu Dong Qiankun
  103922, // Wan Jie Xian Zong – Fairy Legends
  126391, // Immortality – Yong Sheng
  131929, // Ten Thousand Worlds – Wan Jie Du Zun
  168097, // World of Immortals – Chang Sheng Jie
  118201, // Purple River – Zi Chuan
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
  return media.sort((a, b) => ids.indexOf(Number(a.id)) - ids.indexOf(Number(b.id)));
}

