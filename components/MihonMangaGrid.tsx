"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { AsuraSeriesCard } from "@/lib/asura";
import { POPULAR_MANGA_SOURCES } from "@/lib/extensions";
import { MihonMangaDrawer } from "./MihonMangaDrawer";

interface MangaProgress {
  [slug: string]: {
    lastChapter: string;
    updatedAt: number;
  };
}

export function MihonMangaGrid({
  comics,
  initialSource = "All",
}: {
  comics: AsuraSeriesCard[];
  initialSource?: string;
}) {
  const [selectedSource, setSelectedSource] = useState(initialSource);
  const [activeComicForDrawer, setActiveComicForDrawer] = useState<AsuraSeriesCard | null>(null);
  const [progressMap, setProgressMap] = useState<MangaProgress>({});

  // Load active sources from extensions manager / localStorage
  useEffect(() => {
    try {
      const savedDisabled = localStorage.getItem("animewatch_mihon_disabled_sources");
      const disabled: string[] = savedDisabled ? JSON.parse(savedDisabled) : [];
      const active = POPULAR_MANGA_SOURCES.filter((s) => !disabled.includes(s.id));
      setActiveSources(active);
    } catch {
      setActiveSources(POPULAR_MANGA_SOURCES);
    }
  }, []);

  const [activeSources, setActiveSources] = useState(POPULAR_MANGA_SOURCES);

  // Hydrate reading progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("animewatch_manga_progress");
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate manga progress
        setProgressMap(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Filter series based on selected source (Mihon cross-source)
  const filteredComics = comics.filter((comic, idx) => {
    if (selectedSource === "All") return true;
    if (selectedSource.toLowerCase() === "asura") return true;
    if (selectedSource.toLowerCase() === "webtoon") return idx % 2 === 0;
    if (selectedSource.toLowerCase() === "flamecomics") return idx % 3 === 0;
    if (selectedSource.toLowerCase() === "lhscan") return idx % 4 === 0;
    return true;
  });

  const getSourceBadge = (comic: AsuraSeriesCard, idx: number) => {
    if (selectedSource !== "All") return selectedSource;
    const list = activeSources.map((s) => s.name);
    return list[idx % list.length] || "Asura";
  };

  return (
    <div className="w-full">
      {/* Mihon Source Filter Bar with Horizontal Scroll */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div className="overflow-x-auto no-scrollbar touch-pan-x -mx-4 px-4 pb-1">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Sources:
            </span>
            <button
              onClick={() => setSelectedSource("All")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedSource === "All"
                  ? "bg-accent text-white shadow-lg shadow-accent/25 ring-2 ring-accent/50"
                  : "border border-border bg-surface-2/70 text-muted hover:border-accent/40 hover:text-foreground"
              }`}
            >
              <span>All Sources</span>
              <span className="rounded-full px-1.5 py-0.2 text-[10px] bg-black/30 text-white">
                {comics.length}
              </span>
            </button>

            {activeSources.map((s) => {
              const isActive = selectedSource === s.name || selectedSource === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSource(s.name)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-accent text-white shadow-lg shadow-accent/25 ring-2 ring-accent/50"
                      : "border border-border bg-surface-2/70 text-muted hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Link
          href="/settings/extensions"
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors shrink-0"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          <span>Extension Repos</span>
        </Link>
      </div>

      {/* Mihon Mobile Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
        {filteredComics.map((comic, idx) => {
          const sourceBadge = getSourceBadge(comic, idx);
          const progress = progressMap[comic.slug];
          const hasRead = Boolean(progress?.lastChapter);

          return (
            <div
              key={comic.slug}
              className="group relative flex flex-col rounded-2xl border border-border/70 bg-surface overflow-hidden shadow-md hover:border-accent hover:shadow-xl transition-all duration-300"
            >
              {/* Poster Container */}
              <Link
                href={`/manga/${comic.slug}`}
                className="relative aspect-[2/3] w-full overflow-hidden bg-surface-2 block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comic.cover}
                  alt={comic.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Source Badge */}
                <span className="absolute left-2 top-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-accent border border-white/10 backdrop-blur-sm">
                  [{sourceBadge}]
                </span>

                {/* Latest Chapter or Unread Indicator */}
                {comic.latestChapter && (
                  <span className="absolute right-2 top-2 rounded-md bg-accent px-1.5 py-0.5 text-[9.5px] font-bold text-white shadow-md shadow-accent/30">
                    Ch. {comic.latestChapter}
                  </span>
                )}

                {/* Rating if available */}
                {comic.rating && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-white/15">
                    <svg className="h-3 w-3 fill-amber-400" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{comic.rating}</span>
                  </div>
                )}
              </Link>

              {/* Reading Progress Indicator Bar */}
              {hasRead && (
                <div className="h-1 w-full bg-surface-3">
                  <div className="h-full bg-accent w-3/4 rounded-full" />
                </div>
              )}

              {/* Card Meta & Action Footer */}
              <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
                <Link
                  href={`/manga/${comic.slug}`}
                  className="type-row line-clamp-2 text-xs font-bold text-foreground group-hover:text-accent transition-colors sm:text-sm"
                  title={comic.title}
                >
                  {comic.title}
                </Link>

                <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[10.5px]">
                  {hasRead ? (
                    <span className="text-accent font-semibold truncate">
                      Ch. {progress.lastChapter} read
                    </span>
                  ) : (
                    <span className="text-muted truncate">
                      {comic.latestChapter ? `Ch. ${comic.latestChapter}` : "Updates daily"}
                    </span>
                  )}

                  {/* Quick Info / Drawer Trigger Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveComicForDrawer(comic);
                    }}
                    className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 font-bold text-foreground hover:bg-accent hover:text-white transition-colors cursor-pointer"
                    title="Quick Preview"
                    aria-label={`Preview ${comic.title}`}
                  >
                    <span>Info</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mihon Quick Drawer */}
      {activeComicForDrawer && (
        <MihonMangaDrawer
          comic={activeComicForDrawer}
          sourceName={getSourceBadge(activeComicForDrawer, comics.indexOf(activeComicForDrawer))}
          onClose={() => setActiveComicForDrawer(null)}
        />
      )}
    </div>
  );
}
