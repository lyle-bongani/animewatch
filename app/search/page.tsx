import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { SearchFilters } from "@/components/SearchFilters";
import {
  searchAnime,
  getTrending,
  getPopular,
  getTopRated,
  getAiringNow,
} from "@/lib/anilist";
import {
  getCinemetaMovies,
  getCinemetaSeries,
  searchCinemeta,
} from "@/lib/cinemeta";
import { searchAsura, type AsuraSeriesCard } from "@/lib/asura";
import type { Anime } from "@/lib/types";

type SP = Promise<{
  q?: string;
  type?: string;
  page?: string;
  genre?: string;
  format?: string;
  status?: string;
  season?: string;
  year?: string;
  sort?: string;
}>;

// Shortcut queries used by the home page and header "View All" / navigation links.
const BROWSE: Record<string, { title: string; load: () => Promise<Anime[]> }> = {
  trending: { title: "Trending Now", load: () => getTrending(30) },
  airing: { title: "Airing Now", load: () => getAiringNow(30) },
  top: { title: "Top Rated", load: () => getTopRated(30) },
  popular: { title: "Popular Anime", load: () => getPopular(30) },
  movies: { title: "Movies & Blockbusters", load: () => getCinemetaMovies(undefined, 30) },
  movie: { title: "Movies & Blockbusters", load: () => getCinemetaMovies(undefined, 30) },
  series: { title: "TV Shows & Series", load: () => getCinemetaSeries(undefined, 30) },
  tv: { title: "TV Shows & Series", load: () => getCinemetaSeries(undefined, 30) },
  new: { title: "New Releases", load: () => searchAnime("", 1, 30, { sort: ["START_DATE_DESC"] }).then((r) => r.media) },
};

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q} — AnimeWatch` : "Browse Catalog — AnimeWatch" };
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const {
    q = "",
    type = "all",
    page = "1",
    genre,
    format,
    status,
    season,
    year,
    sort,
  } = await searchParams;

  const query = q.trim();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const selectedType = (type || "all").toLowerCase();

  const hasFilters = !!(genre || format || status || season || year || sort);
  const browse = !hasFilters && selectedType === "all" ? BROWSE[query.toLowerCase()] : null;

  let heading: string;
  let animeItems: Anime[] = [];
  let movieItems: Anime[] = [];
  let seriesItems: Anime[] = [];
  let mangaItems: AsuraSeriesCard[] = [];
  let hasNextPage = false;

  if (browse) {
    heading = browse.title;
    animeItems = await browse.load();
  } else if (query || hasFilters) {
    const filters = {
      genres: genre ? [genre] : undefined,
      format: format || undefined,
      status: status || undefined,
      season: season || undefined,
      seasonYear: year ? parseInt(year, 10) || undefined : undefined,
      sort: sort ? [sort] : undefined,
    };

    // Parallel fetch based on selected category type
    const [animeRes, cinemetaRes, asuraRes] = await Promise.all([
      selectedType === "manga"
        ? Promise.resolve({ media: [], hasNextPage: false })
        : searchAnime(query, pageNum, 24, filters).catch(() => ({ media: [], hasNextPage: false })),
      selectedType === "manga" || selectedType === "anime" || pageNum > 1
        ? Promise.resolve([])
        : query
        ? searchCinemeta(query, 20).catch(() => [])
        : Promise.resolve([]),
      selectedType === "movies" || selectedType === "series" || selectedType === "anime" || pageNum > 1
        ? Promise.resolve([])
        : query
        ? searchAsura(query).catch(() => [])
        : Promise.resolve([]),
    ]);

    heading = query ? `Results for "${query}"` : genre ? `${genre} Catalog` : "Filtered Catalog";
    hasNextPage = animeRes.hasNextPage;

    // Filter cinemeta into movies and TV series
    const cinemetaMovies = cinemetaRes.filter((item) => item.format === "MOVIE");
    const cinemetaSeries = cinemetaRes.filter((item) => item.format !== "MOVIE");

    if (selectedType === "movies") {
      movieItems = cinemetaMovies;
      animeItems = animeRes.media.filter((item) => item.format === "MOVIE");
    } else if (selectedType === "series") {
      seriesItems = cinemetaSeries;
      animeItems = animeRes.media.filter((item) => item.format !== "MOVIE");
    } else if (selectedType === "anime") {
      animeItems = animeRes.media;
    } else if (selectedType === "manga") {
      mangaItems = asuraRes;
    } else {
      // "all": present all discovered items
      animeItems = animeRes.media;
      movieItems = cinemetaMovies;
      seriesItems = cinemetaSeries;
      mangaItems = asuraRes;
    }
  } else {
    heading = "Browse Catalog";
    animeItems = await getTrending(30);
  }

  // Combine video media items while preventing duplicate IDs
  const combinedMedia: Anime[] = [];
  const seenIds = new Set<string>();

  for (const item of [...movieItems, ...seriesItems, ...animeItems]) {
    const key = `${item.id}`;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      combinedMedia.push(item);
    }
  }

  const totalResultsCount = combinedMedia.length + mangaItems.length;

  const buildTypeUrl = (t: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (t !== "all") params.set("type", t);
    if (genre) params.set("genre", genre);
    return `/search?${params.toString()}`;
  };

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedType !== "all") params.set("type", selectedType);
    if (genre) params.set("genre", genre);
    if (format) params.set("format", format);
    if (status) params.set("status", status);
    if (season) params.set("season", season);
    if (year) params.set("year", year);
    if (sort) params.set("sort", sort);
    params.set("page", String(targetPage));
    return `/search?${params.toString()}`;
  };

  const TYPE_TABS = [
    { id: "all", label: "All Results", icon: "🌐" },
    { id: "anime", label: "Anime", icon: "⛩️" },
    { id: "movies", label: "Movies", icon: "🎬" },
    { id: "series", label: "TV Series", icon: "📺" },
    { id: "manga", label: "Manga", icon: "📖" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:pt-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-4 flex items-center gap-2 text-xs sm:text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {browse ? browse.title : query ? `"${query}"` : genre ? genre : "Search"}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl text-white tracking-tight">
            {heading}
          </h1>
          {(query || hasFilters) && !browse && (
            <p className="mt-1 text-xs sm:text-sm text-muted">
              {totalResultsCount} title(s) found across Anime, Movies, Series, and Manga
            </p>
          )}
        </div>

        {/* Content Type Filter Pills */}
        {!browse && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {TYPE_TABS.map((tab) => {
              const isActive = selectedType === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={buildTypeUrl(tab.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-accent text-white shadow-md shadow-accent/25 scale-105"
                      : "border border-border/80 bg-surface text-muted hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Advanced Filter drawer */}
      {!browse && selectedType !== "manga" && (
        <Suspense
          fallback={
            <div className="mb-6 h-20 w-full animate-pulse rounded-xl border border-border bg-surface" />
          }
        >
          <SearchFilters />
        </Suspense>
      )}

      {/* Empty State */}
      {totalResultsCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border/80 bg-surface/40 p-6">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 text-muted mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-foreground">No matches found for &ldquo;{query}&rdquo;</h2>
          <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted">
            We couldn&apos;t find anything matching your search. Check spelling or try browsing popular titles.
          </p>
          <Link
            href="/search"
            className="mt-5 rounded-full bg-accent px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/25"
          >
            Clear Search & Filters
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Combined / Filtered Video Media Grid */}
          {combinedMedia.length > 0 && (
            <div>
              {mangaItems.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-4 w-1 rounded bg-accent" />
                  <h2 className="text-base font-bold text-foreground">Anime, Movies & TV Series</h2>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
                {combinedMedia.map((item) => (
                  <AnimeCard
                    key={`${item.format}-${item.id}`}
                    anime={item}
                    mode={
                      item.format === "MOVIE"
                        ? "movies"
                        : (item.streamingEpisodes?.length ?? 0) > 1
                        ? "series"
                        : "anime"
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Manga / Webtoons Grid */}
          {mangaItems.length > 0 && (
            <div>
              {combinedMedia.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-4 w-1 rounded bg-amber-500" />
                  <h2 className="text-base font-bold text-foreground">Manga & Webtoons</h2>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
                {mangaItems.map((comic) => (
                  <MangaCard key={comic.slug} comic={comic} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!browse && (query || hasFilters) && selectedType !== "manga" && (pageNum > 1 || hasNextPage) && (
        <div className="mt-12 flex items-center justify-center gap-3">
          {pageNum > 1 && (
            <Link
              href={buildPageUrl(pageNum - 1)}
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-foreground hover:bg-surface-2 transition-colors"
            >
              ← Previous Page
            </Link>
          )}
          <span className="text-xs font-semibold text-muted">Page {pageNum}</span>
          {hasNextPage && (
            <Link
              href={buildPageUrl(pageNum + 1)}
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-foreground hover:bg-surface-2 transition-colors"
            >
              Next Page →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
