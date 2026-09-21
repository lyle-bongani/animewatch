"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { AsuraSeriesCard } from "@/lib/asura";
import { MihonMangaGrid } from "@/components/MihonMangaGrid";
import { MangaSearchBar } from "@/components/MangaSearchBar";

interface MangaModeLayoutProps {
  comics: AsuraSeriesCard[];
}

export function MangaModeLayout({ comics }: MangaModeLayoutProps) {
  const spotlight = comics.length > 0 ? comics[0] : null;

  return (
    <div className="min-h-screen pb-16 animate-fade-in">
      {/* Top Billboard Spotlight for Manga */}
      {spotlight && (
        <section className="relative -mt-16 mb-8 overflow-hidden border-b border-border/60 bg-gradient-to-b from-surface-2/40 via-background to-background pt-24 pb-10 sm:pt-28 sm:pb-14">
          <div className="absolute inset-0 z-0 opacity-20 filter blur-3xl pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={spotlight.cover}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="relative aspect-[2/3] w-32 sm:w-44 shrink-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spotlight.cover}
                  alt={spotlight.title}
                  className="h-full w-full object-cover"
                />
                {spotlight.rating && (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-xs font-bold text-amber-400 border border-white/20">
                    <svg className="h-3 w-3 fill-amber-400" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{spotlight.rating}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start gap-2.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                    Spotlight Manhwa
                  </span>
                  {spotlight.latestChapter && (
                    <span className="rounded-md bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 border border-border">
                      Latest: Ch. {spotlight.latestChapter}
                    </span>
                  )}
                  <span className="rounded-md bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                    [Asura]
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                  {spotlight.title}
                </h1>

                <p className="text-xs sm:text-sm leading-relaxed text-muted line-clamp-3">
                  Read {spotlight.title} online in high definition with continuous scrolling. Follow the latest updates, character progression, and explosive battle scenes.
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/manga/${spotlight.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all cursor-pointer"
                  >
                    <span>Read Series</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {spotlight.latestChapter && (
                    <Link
                      href={`/manga/${spotlight.slug}/chapter/${spotlight.latestChapter}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
                    >
                      <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      <span>Chapter {spotlight.latestChapter}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider sm:text-2xl text-foreground flex items-center gap-2.5">
              <span className="inline-block h-5 w-1.5 rounded bg-amber-500" />
              Mihon Manga & Webtoon Catalog
            </h2>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Explore cross-source manga, manhwa, and webtoons with unread trackers and cascade reading mode.
            </p>
          </div>

          <MangaSearchBar />
        </div>

        {/* Mihon Grid with Source Filters */}
        <MihonMangaGrid comics={comics} />
      </div>
    </div>
  );
}
