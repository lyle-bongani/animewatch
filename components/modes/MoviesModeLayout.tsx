"use client";

import React from "react";
import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { ContinueWatching } from "@/components/ContinueWatching";
import type { Anime } from "@/lib/types";

interface MoviesModeLayoutProps {
  trending: Anime[];
  action: Anime[];
  scifi: Anime[];
  drama: Anime[];
  comedy: Anime[];
}

export function MoviesModeLayout({
  trending,
  action,
  scifi,
  drama,
  comedy,
}: MoviesModeLayoutProps) {
  const spotlight = trending.length > 0 ? trending.slice(0, 5) : action.slice(0, 5);
  const hasSpotlight = spotlight.length > 0;

  return (
    <div className={hasSpotlight ? "-mt-16 pb-12 animate-fade-in" : "pt-4 pb-12 animate-fade-in"}>
      {hasSpotlight && <HeroSpotlight items={spotlight} mode="movies" />}

      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <div className="mx-auto w-full max-w-7xl px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider sm:text-3xl text-foreground flex items-center gap-2.5">
              <span className="inline-block h-6 w-1.5 rounded bg-blue-500" />
              Movies Mode
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Stream trending theatrical blockbusters, sci-fi adventures, award-winning dramas, and comedy hits.
            </p>
          </div>
        </div>

        <ContinueWatching />

        {trending.length > 0 && (
          <AnimeRow
            title="Top 10 Blockbuster Movies Today"
            items={trending.slice(0, 10)}
            href="/search?q=movies"
            numbered
            mode="movies"
          />
        )}

        {action.length > 0 && (
          <AnimeRow
            title="Action & High-Octane Adventures"
            items={action}
            href="/search?q=action%20movies"
            mode="movies"
          />
        )}

        {scifi.length > 0 && (
          <AnimeRow
            title="Sci-Fi & Futuristic Sagas"
            items={scifi}
            href="/search?q=scifi%20movies"
            mode="movies"
          />
        )}

        {drama.length > 0 && (
          <AnimeRow
            title="Acclaimed Drama & Psychological Thrillers"
            items={drama}
            href="/search?q=drama%20movies"
            mode="movies"
          />
        )}

        {comedy.length > 0 && (
          <AnimeRow
            title="Comedy & Feel-Good Cinema"
            items={comedy}
            href="/search?q=comedy%20movies"
            mode="movies"
          />
        )}
      </div>
    </div>
  );
}
