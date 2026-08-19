import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AnimeGrid } from "@/components/AnimeGrid";
import { SearchFilters } from "@/components/SearchFilters";
import {
  searchAnime,
  getTrending,
  getPopular,
  getTopRated,
  getAiringNow,
} from "@/lib/anilist";
import type { Anime } from "@/lib/types";

type SP = Promise<{
  q?: string;
  page?: string;
  genre?: string;
  format?: string;
  status?: string;
  season?: string;
  year?: string;
  sort?: string;
}>;

// Shortcut queries used by the home page "View All" links.
const BROWSE: Record<string, { title: string; load: () => Promise<Anime[]> }> = {
  trending: { title: "Trending Now", load: () => getTrending(30) },
  airing: { title: "Airing Now", load: () => getAiringNow(30) },
  top: { title: "Top Rated", load: () => getTopRated(30) },
  popular: { title: "Popular Anime", load: () => getPopular(30) },
};

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Browse Anime" };
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const {
    q = "",
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

  const hasFilters = !!(genre || format || status || season || year || sort);
  const browse = !hasFilters ? BROWSE[query.toLowerCase()] : null;

  let heading: string;
  let items: Anime[];
  let hasNextPage = false;

  if (browse) {
    heading = browse.title;
    items = await browse.load();
  } else if (query || hasFilters) {
    const filters = {
      genres: genre ? [genre] : undefined,
      format: format || undefined,
      status: status || undefined,
      season: season || undefined,
      seasonYear: year ? parseInt(year, 10) || undefined : undefined,
      sort: sort ? [sort] : undefined,
    };
    const res = await searchAnime(query, pageNum, 24, filters);
    heading = query ? `Results for "${query}"` : "Filtered Results";
    items = res.media;
    hasNextPage = res.hasNextPage;
  } else {
    heading = "Browse Anime";
    items = await getTrending(30);
  }

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (genre) params.set("genre", genre);
    if (format) params.set("format", format);
    if (status) params.set("status", status);
    if (season) params.set("season", season);
    if (year) params.set("year", year);
    if (sort) params.set("sort", sort);
    params.set("page", String(targetPage));
    return `/search?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:pt-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">{browse ? browse.title : query ? `"${query}"` : "Search"}</span>
      </div>

      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">{heading}</h1>

      {/* SearchFilters MUST be wrapped in Suspense — it uses useSearchParams() */}
      {!browse && (
        <Suspense fallback={
          <div className="mb-6 h-24 w-full animate-pulse rounded-xl border border-border bg-surface" />
        }>
          <SearchFilters />
        </Suspense>
      )}

      {!browse && (query || hasFilters) && (
        <p className="mb-4 text-sm text-muted">{items.length} title(s) found</p>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg
            width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            strokeLinejoin="round" className="mb-4 text-muted"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <h2 className="text-lg font-semibold">No results found</h2>
          <p className="mt-1 text-sm text-muted">Try a different search term or adjust the filters.</p>
          <Link
            href="/search"
            className="mt-5 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Clear Search
          </Link>
        </div>
      ) : (
        <AnimeGrid items={items} />
      )}

      {/* Pagination — only for real search/filter queries */}
      {!browse && (query || hasFilters) && (pageNum > 1 || hasNextPage) && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {pageNum > 1 && (
            <Link
              href={buildPageUrl(pageNum - 1)}
              className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium hover:bg-surface-2"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-muted">Page {pageNum}</span>
          {hasNextPage && (
            <Link
              href={buildPageUrl(pageNum + 1)}
              className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium hover:bg-surface-2"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
