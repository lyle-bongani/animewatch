"use client";

import { useState } from "react";
import Link from "next/link";
import type { AsuraChapter } from "@/lib/asura";

export function MangaChapterList({
  slug,
  chapters,
}: {
  slug: string;
  chapters: AsuraChapter[];
}) {
  const [filter, setFilter] = useState("");
  const [descending, setDescending] = useState(true);

  const filtered = chapters.filter((c) => {
    if (!filter.trim()) return true;
    return c.number.includes(filter.trim()) || (c.title && c.title.toLowerCase().includes(filter.toLowerCase()));
  });

  const sorted = [...filtered].sort((a, b) => {
    const numA = parseFloat(a.number) || 0;
    const numB = parseFloat(b.number) || 0;
    return descending ? numB - numA : numA - numB;
  });

  return (
    <div className="rounded-2xl border border-border bg-surface/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Directory Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </span>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Chapters Directory ({chapters.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Chapter Quick Search */}
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter chapter #..."
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort Order Button */}
          <button
            type="button"
            onClick={() => setDescending(!descending)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-3 transition-colors shrink-0 cursor-pointer"
            title="Toggle sort direction"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${descending ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="m3 16 4 4 4-4" />
              <path d="M7 20V4" />
              <path d="m21 8-4-4-4 4" />
              <path d="M17 4v16" />
            </svg>
            <span>{descending ? "Newest First" : "Oldest First"}</span>
          </button>
        </div>
      </div>

      {/* Chapters Grid */}
      {sorted.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted">
          No chapters match &quot;{filter}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 max-h-[560px] overflow-y-auto pr-1">
          {sorted.map((ch) => (
            <Link
              key={ch.number}
              href={`/manga/${slug}/chapter/${ch.number}`}
              className="group flex flex-col justify-between rounded-xl border border-border/70 bg-surface-2/60 p-2.5 sm:p-3 hover:border-accent/80 hover:bg-surface-3 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                  Chapter {ch.number}
                </span>
                <svg
                  className="h-3 w-3 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              {ch.publishedAt && (
                <span className="mt-1 text-[10px] text-muted truncate">
                  {ch.publishedAt}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
