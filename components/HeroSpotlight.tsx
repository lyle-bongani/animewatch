"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Anime } from "@/lib/types";
import {
  displayTitle,
  stripHtml,
  formatLabel,
  matchPercent,
  maturityLabel,
  is3D,
} from "@/lib/types";
import { TrailerModal } from "./TrailerModal";

export function HeroSpotlight({
  items,
  mode = "anime",
}: {
  items: Anime[];
  mode?: "anime" | "movies" | "series" | "manga";
}) {
  const [index, setIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const count = items.length;

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 8000);
    return () => clearInterval(t);
  }, [count]);

  const currentItem = items[index];

  // Watchlist check for current slide
  useEffect(() => {
    if (!currentItem) return;
    try {
      const stored = localStorage.getItem("animewatch_watchlist");
      if (stored) {
        const list = JSON.parse(stored) as { id: number | string }[];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate watchlist status on item change
        setInWatchlist(list.some((item) => item.id === currentItem.id));
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when empty
        setInWatchlist(false);
      }
    } catch {
      /* ignore */
    }
  }, [currentItem]);

  if (count === 0 || !currentItem) return null;

  const a = currentItem;
  const isMovie = mode === "movies" || a.format === "MOVIE";
  const isSeries = mode === "series" || a.format === "TV" || (a.streamingEpisodes && a.streamingEpisodes.length > 1);
  const isChinese = a.countryOfOrigin === "CN";
  const ep = a.nextAiringEpisode?.episode ? a.nextAiringEpisode.episode - 1 : a.episodes;
  const match = matchPercent(a);

  // Touch Swipe Handlers for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      // Swiped Left -> Next
      go(1);
    } else if (distance < -50) {
      // Swiped Right -> Prev
      go(-1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const toggleWatchlist = () => {
    try {
      const stored = localStorage.getItem("animewatch_watchlist");
      let list = stored ? JSON.parse(stored) : [];
      if (inWatchlist) {
        list = list.filter((i: { id: number | string }) => i.id !== a.id);
        setInWatchlist(false);
      } else {
        list.unshift({
          id: a.id,
          title: displayTitle(a),
          coverImage: a.coverImage.extraLarge ?? a.coverImage.large ?? "",
          format: a.format,
          seasonYear: a.seasonYear,
        });
        setInWatchlist(true);
      }
      localStorage.setItem("animewatch_watchlist", JSON.stringify(list));
      window.dispatchEvent(new Event("watchlist-update"));
    } catch {
      /* ignore */
    }
  };

  const hasTrailer = a.trailer?.site === "youtube" && a.trailer.id;

  const getRankBadge = () => {
    if (mode === "movies") return `#${index + 1} in Movies Today`;
    if (mode === "series") return `#${index + 1} in TV Shows Today`;
    if (mode === "manga") return `#${index + 1} Trending Manga`;
    return `#${index + 1} in Anime Today`;
  };

  return (
    <section
      className="relative h-[70vh] min-h-[500px] w-full overflow-hidden sm:h-[80vh] lg:h-screen select-none touch-pan-x"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Billboard background poster */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={a.id}
        src={a.bannerImage ?? a.coverImage.extraLarge ?? a.coverImage.large ?? ""}
        alt={displayTitle(a)}
        className="animate-fade-in absolute inset-0 h-full w-full object-cover"
      />

      {/* Netflix-style multi-directional shadow gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

      {/* Billboard Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-16 sm:px-8 sm:pb-28">
        <div className="max-w-xl">
          {/* Top Category / Ranking Tag */}
          <div className="mb-2 flex items-center gap-2 sm:mb-3">
            <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-accent/30">
              Top 10
            </span>
            <span className="text-xs font-bold text-foreground/90 sm:text-sm">
              {getRankBadge()}
            </span>
          </div>

          <h1 className="type-display text-3xl text-white drop-shadow-xl sm:text-5xl lg:text-6xl line-clamp-2">
            {displayTitle(a)}
          </h1>

          {/* Mode-Tailored Meta Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs sm:mt-4 sm:gap-x-3 sm:text-sm">
            {match != null && (
              <span className="font-extrabold text-[color:var(--color-match)]">{match}% Match</span>
            )}
            {a.seasonYear && <span className="font-semibold text-foreground/90">{a.seasonYear}</span>}
            <span className="rounded border border-white/40 px-1.5 py-0.2 text-xs text-zinc-200">
              {maturityLabel(a)}
            </span>

            {/* Movies mode specific duration / HD */}
            {isMovie ? (
              <>
                <span className="rounded bg-accent/20 border border-accent/40 px-1.5 text-xs font-bold text-accent">
                  Movie
                </span>
                {a.duration && (
                  <span className="text-foreground/90 font-medium">
                    {Math.floor(a.duration / 60)}h {a.duration % 60}m
                  </span>
                )}
              </>
            ) : isSeries ? (
              <>
                <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 text-xs font-bold text-emerald-400">
                  TV Series
                </span>
                {!!ep && <span className="text-foreground/90 font-medium">{ep} Episodes</span>}
              </>
            ) : (
              <>
                {!!ep && <span className="text-foreground/90 font-medium">{ep} eps</span>}
                {a.format && <span className="text-foreground/80">{formatLabel(a.format)}</span>}
                {isChinese ? (
                  <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 text-xs font-bold text-amber-400">
                    {is3D(a) ? "3D Donghua" : "2D Donghua"}
                  </span>
                ) : (
                  <span className="rounded bg-purple-500/20 border border-purple-500/40 px-1.5 text-xs font-bold text-purple-300">
                    Sub & Dub
                  </span>
                )}
              </>
            )}

            <span className="rounded bg-white/20 px-1.5 text-xs font-bold text-zinc-100">4K Ultra HD</span>
          </div>

          <p className="mt-3 line-clamp-2 max-w-lg text-xs text-foreground/85 drop-shadow sm:mt-4 sm:line-clamp-3 sm:text-sm lg:text-base">
            {stripHtml(a.description) || "Stream in ultra high-definition with subbed & dubbed playback across all devices."}
          </p>

          {/* Mobile and Desktop Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
            {/* White Primary Play CTA */}
            <Link
              href={`/watch/${a.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-white/10 transition-all hover:bg-white/90 active:scale-95 sm:px-7 sm:py-3 sm:text-base cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Watch Now</span>
            </Link>

            {/* Watchlist Toggle Button */}
            <button
              onClick={toggleWatchlist}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold backdrop-blur transition-all active:scale-95 sm:px-5 sm:py-3 sm:text-base cursor-pointer ${
                inWatchlist
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-white/30 bg-black/40 text-white hover:bg-black/60"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={inWatchlist ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{inWatchlist ? "In List" : "Add to List"}</span>
            </button>

            {/* Official Trailer Button if available */}
            {hasTrailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/30 bg-black/40 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-black/60 active:scale-95 sm:px-5 sm:py-3 sm:text-base cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>Trailer</span>
              </button>
            )}

            {/* More Info Link */}
            <Link
              href={`/anime/${a.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-zinc-600/40 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-zinc-600/60 active:scale-95 sm:px-5 sm:py-3 sm:text-base cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
              </svg>
              <span>Details</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Maturity tag on the right edge */}
      <div className="absolute bottom-28 right-0 hidden items-center gap-2 border-l-2 border-white/60 bg-black/40 py-1.5 pl-3 pr-6 text-sm text-white backdrop-blur-md lg:flex rounded-l-lg">
        <span className="font-bold">{maturityLabel(a)}</span>
        <span className="text-xs text-zinc-300">Ultra HD</span>
      </div>

      {/* Carousel indicators */}
      {count > 1 && (
        <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-12 z-20">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === index ? "w-8 bg-accent shadow-md shadow-accent/50" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && a.trailer?.id && (
        <TrailerModal
          youtubeId={a.trailer.id}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </section>
  );
}
