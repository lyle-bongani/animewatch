"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import type { Anime } from "@/lib/types";
import {
  displayTitle,
  stripHtml,
  formatLabel,
  matchPercent,
  maturityLabel,
} from "@/lib/types";

export function HeroSpotlight({ items }: { items: Anime[] }) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 8000);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const a = items[index];
  const ep = a.nextAiringEpisode?.episode ? a.nextAiringEpisode.episode - 1 : a.episodes;
  const match = matchPercent(a);

  return (
    <section className="relative h-[100vh] min-h-[600px] w-full overflow-hidden">
      {/* Billboard background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={a.id}
        src={a.bannerImage ?? a.coverImage.extraLarge ?? a.coverImage.large ?? ""}
        alt=""
        className="animate-fade-in absolute inset-0 h-full w-full object-cover"
      />
      {/* Netflix-style gradients: dark from the left for text, fade to page at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="max-w-xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              Top 10
            </span>
            <span className="text-sm font-semibold text-foreground/80">
              #{index + 1} in Anime Today
            </span>
          </div>

          <h1 className="type-display text-4xl text-white drop-shadow-lg sm:text-6xl">
            {displayTitle(a)}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {match != null && (
              <span className="font-bold text-[color:var(--color-match)]">{match}% Match</span>
            )}
            {a.seasonYear && <span className="text-foreground/90">{a.seasonYear}</span>}
            <span className="rounded border border-white/40 px-1.5 text-xs text-zinc-200">
              {maturityLabel(a)}
            </span>
            {!!ep && <span className="text-foreground/80">{ep} eps</span>}
            {a.format && <span className="text-foreground/80">{formatLabel(a.format)}</span>}
            <span className="rounded bg-white/15 px-1.5 text-xs text-zinc-200">HD</span>
          </div>

          <p className="mt-4 line-clamp-3 max-w-lg text-sm text-foreground/80 drop-shadow sm:text-base">
            {stripHtml(a.description) || "No synopsis available."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* White Play — the signature Netflix billboard button */}
            <Link
              href={`/watch/${a.id}`}
              className="inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-white px-7 py-2.5 text-base font-bold text-black transition-colors hover:bg-white/85"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </Link>
            <Link
              href={`/anime/${a.id}`}
              className="inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-zinc-500/40 px-7 py-2.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-zinc-500/30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
              </svg>
              More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Maturity tag on the right edge (Netflix billboard cue) */}
      <div className="absolute bottom-28 right-0 hidden items-center gap-2 border-l-2 border-white/60 bg-black/30 py-1 pl-3 pr-6 text-sm text-white backdrop-blur lg:flex">
        {maturityLabel(a)}
      </div>

      {/* Carousel controls */}
      {count > 1 && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-10">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-accent" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}
