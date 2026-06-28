"use client";

import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import type { Anime } from "@/lib/types";
import { displayTitle, stripHtml, formatLabel } from "@/lib/types";

export function HeroSpotlight({ items }: { items: Anime[] }) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const a = items[index];
  const ep = a.nextAiringEpisode?.episode ? a.nextAiringEpisode.episode - 1 : a.episodes;

  return (
    <section className="relative h-[68vh] min-h-[420px] w-full overflow-hidden">
      {/* Background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={a.id}
        src={a.bannerImage ?? a.coverImage.extraLarge ?? a.coverImage.large ?? ""}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />

      {/* Content wrapper */}
      <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-14">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_300px] items-end">
          {/* Left Details */}
          <div className="max-w-2xl">
            <span className="mb-3 inline-block rounded-md border border-accent/30 bg-accent/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-accent">
              #{index + 1} Spotlight
            </span>
            <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl">
              {displayTitle(a)}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted sm:text-sm">
              {a.format && <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs font-semibold">{formatLabel(a.format)}</span>}
              {!!ep && <span>{ep} episodes</span>}
              {a.seasonYear && <span>{a.seasonYear}</span>}
            </div>
            
            {/* Rating Stars box */}
            {a.averageScore && (
              <div className="mt-4 flex items-center gap-2">
                <svg className="h-6 w-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted block leading-none font-bold">Score Rating</span>
                  <span className="text-sm font-extrabold leading-none text-foreground">{(a.averageScore / 10).toFixed(1)} / 10</span>
                </div>
              </div>
            )}

            <p className="mt-4 line-clamp-3 text-sm text-foreground/80 sm:text-base leading-relaxed">
              {stripHtml(a.description) || "No synopsis available."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-border bg-surface/60 px-2.5 py-0.5 text-xs text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                href={`/watch/${a.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover shadow-lg shadow-accent/25"
              >
                <PlayIcon /> Watch Now
              </Link>
              <Link
                href={`/anime/${a.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-surface-2"
              >
                + Add to List
              </Link>
            </div>
          </div>

          {/* Right Preview Thumbnails */}
          <div className="hidden lg:flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Up Next</span>
            {items.map((item, i) => {
              if (i === index) return null;
              
              return (
                <div
                  key={item.id}
                  onClick={() => setIndex(i)}
                  className="group/thumb relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface-2 cursor-pointer transition-all hover:border-accent hover:shadow-md"
                >
                  <img
                    src={item.bannerImage ?? item.coverImage.extraLarge ?? item.coverImage.large ?? ""}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 transition-colors group-hover/thumb:bg-black/20" />
                  
                  {/* Play Button Icon in center */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover/thumb:opacity-100 transition-opacity">
                    <div className="rounded-full bg-accent/90 p-2 text-white shadow-lg transition-transform group-hover/thumb:scale-110">
                      <PlayIcon />
                    </div>
                  </div>

                  {/* Title at the bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="line-clamp-1 text-[11px] font-bold text-white">
                      {displayTitle(item)}
                    </span>
                  </div>
                </div>
              );
            }).filter((item): item is React.ReactElement => item !== null).slice(0, 3)}
          </div>
        </div>
      </div>

      {/* Controls */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-background/60 p-2 backdrop-blur hover:bg-surface-2 sm:block"
          >
            <Chevron dir="left" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-background/60 p-2 backdrop-blur hover:bg-surface-2 sm:block"
          >
            <Chevron dir="right" />
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-accent" : "w-2 bg-foreground/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
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
