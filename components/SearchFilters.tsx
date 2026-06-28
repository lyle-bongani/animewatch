"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRES, FORMATS, STATUSES, SEASONS, SORTS } from "@/lib/genres";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current params
  const q = searchParams.get("q") ?? "";
  const genre = searchParams.get("genre") ?? "";
  const format = searchParams.get("format") ?? "";
  const status = searchParams.get("status") ?? "";
  const season = searchParams.get("season") ?? "";
  const year = searchParams.get("year") ?? "";
  const sort = searchParams.get("sort") ?? "POPULARITY_DESC";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page to 1 when filters change
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const hasActiveFilters = genre || format || status || season || year || sort !== "POPULARITY_DESC";

  return (
    <div className="rounded-xl border border-border bg-surface p-4 mb-6">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filter Anime
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-accent hover:underline font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Genre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted">Genre</label>
          <select
            value={genre}
            onChange={(e) => updateParam("genre", e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted">Format</label>
          <select
            value={format}
            onChange={(e) => updateParam("format", e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          >
            <option value="">All Formats</option>
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted">Status</label>
          <select
            value={status}
            onChange={(e) => updateParam("status", e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted">Season</label>
          <select
            value={season}
            onChange={(e) => updateParam("season", e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          >
            <option value="">All Seasons</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted">Year</label>
          <input
            type="number"
            placeholder="e.g. 2024"
            value={year}
            min="1970"
            max={new Date().getFullYear() + 2}
            onChange={(e) => updateParam("year", e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted/65 focus:border-accent"
          />
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted">Sort By</label>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
