"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { searchAnime } from "@/lib/anilist";
import { AnimeCard } from "./AnimeCard";
import type { Anime } from "@/lib/types";
import { is3D } from "@/lib/types";

export function DonghuaBrowser() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [type, setType] = useState<"all" | "2d" | "3d">("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("POPULARITY_DESC");
  const [genre, setGenre] = useState<string>("all");
  const [year, setYear] = useState<string>("all");

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchDonghua = useCallback(async (pageNum: number, isAppend: boolean) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setFetchingMore(true);

      const filters: any = {
        countryOfOrigin: "CN",
        sort: [sort],
      };

      if (status !== "all") filters.status = status;
      if (genre !== "all") filters.genres = [genre];
      if (year !== "all") filters.seasonYear = Number(year);

      const res = await searchAnime(query, pageNum, 24, filters);

      // Client-side filtering for 2D/3D type
      let filteredMedia = res.media;
      if (type !== "all") {
        filteredMedia = res.media.filter((item) => {
          const is3d = is3D(item);
          return type === "3d" ? is3d : !is3d;
        });
      }

      if (isAppend) {
        setResults((prev) => [...prev, ...filteredMedia]);
      } else {
        setResults(filteredMedia);
      }
      setHasNext(res.hasNextPage);
      setPage(res.currentPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [query, type, status, sort, genre, year]);

  // Debounced search / filter update
  useEffect(() => {
    const t = setTimeout(() => {
      fetchDonghua(1, false);
    }, 300);
    return () => clearTimeout(t);
  }, [fetchDonghua]);

  return (
    <div className="w-full">
      {/* Search and Filters Section */}
      <div className="mb-8 rounded-lg border border-border/60 bg-surface-2 p-5 shadow-lg sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search Chinese Anime (Donghua)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          {/* Quick info counter */}
          <div className="text-xs font-semibold uppercase tracking-wider text-muted md:text-right">
            Showing {results.length} titles
          </div>
        </div>

        {/* Filters Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {/* Type Filter */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
            >
              <option value="all">All (2D & 3D)</option>
              <option value="2d">2D Donghua</option>
              <option value="3d">3D Donghua</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
            >
              <option value="all">All Statuses</option>
              <option value="RELEASING">Ongoing</option>
              <option value="FINISHED">Completed</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
            >
              <option value="POPULARITY_DESC">Most Popular</option>
              <option value="START_DATE_DESC">New Releases</option>
              <option value="TRENDING_DESC">Recently Updated</option>
              <option value="SCORE_DESC">Top Rated</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
            >
              <option value="all">All Genres</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Martial Arts">Cultivation / Wuxia</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
            >
              <option value="all">All Years</option>
              {Array.from({ length: 7 }, (_, i) => String(2026 - i)).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : results.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg font-semibold text-muted">No Chinese Anime found.</p>
          <p className="mt-1 text-sm text-muted/80">Try adjusting your search queries or filter criteria.</p>
        </div>
      ) : (
        <div>
          <div className="netflix-grid grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((item) => (
              <AnimeCard key={item.id} anime={item} />
            ))}
          </div>

          {/* Load More Button */}
          {hasNext && (
            <div className="mt-12 flex justify-center">
              <button
                disabled={fetchingMore}
                onClick={() => fetchDonghua(page + 1, true)}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50 cursor-pointer"
              >
                {fetchingMore ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  "Load More Titles"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
