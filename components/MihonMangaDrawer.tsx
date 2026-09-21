"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { AsuraSeriesCard } from "@/lib/asura";

interface MihonMangaDrawerProps {
  comic: AsuraSeriesCard | null;
  onClose: () => void;
  sourceName?: string;
}

export function MihonMangaDrawer({
  comic,
  onClose,
  sourceName = "Asura",
}: MihonMangaDrawerProps) {
  const [inLibrary, setInLibrary] = useState(false);
  const [readingMode, setReadingMode] = useState<"cascade" | "single">("cascade");

  useEffect(() => {
    if (!comic) return;
    try {
      const stored = localStorage.getItem("animewatch_manga_library");
      if (stored) {
        const list = JSON.parse(stored) as { slug: string }[];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate library state on comic change
        setInLibrary(list.some((item) => item.slug === comic.slug));
      }
      const savedMode = localStorage.getItem("animewatch_reader_mode") as "cascade" | "single" | null;
      if (savedMode) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate reader mode preference
        setReadingMode(savedMode);
      }
    } catch {
      /* ignore */
    }
  }, [comic]);

  useEffect(() => {
    if (!comic) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [comic, onClose]);

  if (!comic) return null;

  const toggleLibrary = () => {
    try {
      const stored = localStorage.getItem("animewatch_manga_library");
      let list = stored ? (JSON.parse(stored) as AsuraSeriesCard[]) : [];
      if (inLibrary) {
        list = list.filter((i) => i.slug !== comic.slug);
        setInLibrary(false);
      } else {
        list.unshift(comic);
        setInLibrary(true);
      }
      localStorage.setItem("animewatch_manga_library", JSON.stringify(list));
      window.dispatchEvent(new Event("manga-library-update"));
    } catch {
      /* ignore */
    }
  };

  const handleModeChange = (mode: "cascade" | "single") => {
    setReadingMode(mode);
    try {
      localStorage.setItem("animewatch_reader_mode", mode);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-3xl sm:rounded-3xl border border-border/80 bg-surface shadow-2xl overflow-hidden transition-all duration-300 animate-slide-up">
        {/* Mobile Pull Bar Indicator */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden cursor-pointer" onClick={onClose}>
          <div className="h-1.5 w-12 rounded-full bg-border" />
        </div>

        {/* Header with Cover & Info */}
        <div className="flex gap-4 p-5 sm:p-6 border-b border-border/60">
          <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-xl border border-border shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={comic.cover} alt={comic.title} className="h-full w-full object-cover" />
            <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-black uppercase text-accent border border-white/10">
              [{sourceName}]
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent border border-accent/20">
                  Mihon Webtoon
                </span>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-muted hover:bg-surface-2 hover:text-foreground"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <h3 className="mt-1.5 text-base sm:text-lg font-bold text-foreground line-clamp-2">
                {comic.title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                {comic.rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <svg className="h-3.5 w-3.5 fill-amber-400" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {comic.rating}
                  </span>
                )}
                {comic.latestChapter && (
                  <span className="rounded bg-surface-2 px-2 py-0.5 font-medium text-foreground">
                    Latest: Ch. {comic.latestChapter}
                  </span>
                )}
              </div>
            </div>

            {/* Bookmark / Library Button */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={toggleLibrary}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  inLibrary
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-surface-2/80 text-foreground hover:bg-surface-3"
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={inLibrary ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {inLibrary ? "In Library" : "+ Add to Library"}
              </button>
            </div>
          </div>
        </div>

        {/* Reader Preferences Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-surface-2/40 border-b border-border/50 text-xs">
          <span className="text-muted font-medium">Reader Mode:</span>
          <div className="flex items-center gap-1 bg-surface-3 p-1 rounded-lg border border-border">
            <button
              onClick={() => handleModeChange("cascade")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                readingMode === "cascade"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Cascade (Continuous)
            </button>
            <button
              onClick={() => handleModeChange("single")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                readingMode === "single"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Single Page
            </button>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="p-5 sm:p-6 bg-surface flex items-center gap-3">
          <Link
            href={`/manga/${comic.slug}`}
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-surface-2 border border-border px-4 py-3 text-xs sm:text-sm font-bold text-foreground hover:bg-surface-3 transition-colors text-center"
          >
            <span>View All Chapters</span>
          </Link>

          {comic.latestChapter && (
            <Link
              href={`/manga/${comic.slug}/chapter/${comic.latestChapter}`}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all text-center"
            >
              <span>Read Ch. {comic.latestChapter}</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
