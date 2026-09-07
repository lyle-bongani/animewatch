"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MangaSearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/manga?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/manga");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <svg
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search manhwa & manga by title (e.g. Solo Max-Level, Return, Reincarnator)..."
          className="w-full rounded-xl border border-border bg-surface-2/90 py-2.5 pl-10 pr-24 text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.push("/manga");
            }}
            className="absolute right-16 p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
}
