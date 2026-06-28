import type { Metadata } from "next";
import Link from "next/link";
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

// Shortcut queries used by the home page "View all" links.
const BROWSE: Record<string, { title: string; load: () => Promise<Anime[]> }> = {
  trending: { title: "Trending Now", load: () => getTrending(30) },
  airing: { title: "Airing Now", load: () => getAiringNow(30) },
  top: { title: "Top Rated", load: () => getTopRated(30) },
  popular: { title: "Popular Anime", load: () => getPopular(30) },
};

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
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
    heading = query ? `Results for “${query}”` : "Filtered Results";
    items = res.media;
    hasNextPage = res.hasNextPage;
  } else {
    heading = "Browse";
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{heading}</h1>
      
      {!browse && <SearchFilters />}

      {!browse && (query || hasFilters) && (
        <p className="mb-6 text-sm text-muted">{items.length} title(s) on this page</p>
      )}

      <div className="mt-6">
        <AnimeGrid items={items} />
      </div>

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

