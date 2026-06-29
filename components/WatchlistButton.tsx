"use client";

import { useEffect, useState } from "react";
import type { Anime } from "@/lib/types";
import { displayTitle } from "@/lib/types";

interface WatchlistItem {
  id: number;
  title: string;
  coverImage: string;
  format?: string | null;
  seasonYear?: number | null;
}

export function WatchlistButton({ anime }: { anime: Anime }) {
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("animewatch_watchlist");
      if (stored) {
        const list = JSON.parse(stored) as WatchlistItem[];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage on mount
        setInWatchlist(list.some((item) => item.id === anime.id));
      }
    } catch (e) {
      console.error(e);
    }
  }, [anime.id]);

  const toggleWatchlist = () => {
    try {
      const stored = localStorage.getItem("animewatch_watchlist");
      let list: WatchlistItem[] = stored ? (JSON.parse(stored) as WatchlistItem[]) : [];

      if (inWatchlist) {
        list = list.filter((item) => item.id !== anime.id);
        setInWatchlist(false);
      } else {
        const item: WatchlistItem = {
          id: anime.id,
          title: displayTitle(anime),
          coverImage: anime.coverImage.extraLarge ?? anime.coverImage.large ?? "",
          format: anime.format,
          seasonYear: anime.seasonYear,
        };
        list.unshift(item); // Add to the beginning
        setInWatchlist(true);
      }

      localStorage.setItem("animewatch_watchlist", JSON.stringify(list));
      // Dispatch custom event to update other components (like navbar) if needed
      window.dispatchEvent(new Event("watchlist-update"));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all ${
        inWatchlist
          ? "border-accent bg-accent/10 text-accent hover:bg-accent/20"
          : "border-border bg-surface/60 text-foreground hover:bg-surface-2"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={inWatchlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-200 group-hover:scale-110"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {inWatchlist ? "In Watchlist" : "Add to List"}
    </button>
  );
}
