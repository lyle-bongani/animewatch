"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatLabel } from "@/lib/types";

interface WatchlistItem {
  id: number;
  title: string;
  coverImage: string;
  format?: string | null;
  seasonYear?: number | null;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchlist = () => {
      try {
        const stored = localStorage.getItem("animewatch_watchlist");
        if (stored) {
          setWatchlist(JSON.parse(stored) as WatchlistItem[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
    window.addEventListener("watchlist-update", loadWatchlist);
    return () => window.removeEventListener("watchlist-update", loadWatchlist);
  }, []);

  const removeItem = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem("animewatch_watchlist");
      if (stored) {
        const list = JSON.parse(stored) as WatchlistItem[];
        const updated = list.filter((item) => item.id !== id);
        localStorage.setItem("animewatch_watchlist", JSON.stringify(updated));
        setWatchlist(updated);
        window.dispatchEvent(new Event("watchlist-update"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-muted">
        Loading Watchlist...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="mr-2 inline-block h-5 w-1 rounded bg-accent align-middle" />
          My Watchlist
        </h1>
        <span className="text-sm text-muted">{watchlist.length} items</span>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted mb-4"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h2 className="text-lg font-semibold">Your watchlist is empty</h2>
          <p className="text-sm text-muted mt-1 max-w-sm">
            Explore trending anime and click &quot;Add to List&quot; to save them here for easy access.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Browse Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {watchlist.map((anime) => (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="group block relative focus:outline-none"
              title={anime.title}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition-all group-hover:ring-accent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={anime.coverImage}
                  alt={anime.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Remove button */}
                <button
                  onClick={(e) => removeItem(e, anime.id)}
                  className="absolute right-2 top-2 rounded bg-black/80 p-1.5 text-red-400 backdrop-blur hover:bg-red-500 hover:text-white transition-colors"
                  title="Remove from Watchlist"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>

                <span className="absolute inset-x-0 bottom-0 translate-y-2 p-3 text-xs text-white/90 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  {[formatLabel(anime.format), anime.seasonYear]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>

              <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
                {anime.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
