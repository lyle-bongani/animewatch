"use client";

import React from "react";
import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { ContinueWatching } from "@/components/ContinueWatching";
import type { Anime } from "@/lib/types";

interface SeriesModeLayoutProps {
  trending: Anime[];
  crime: Anime[];
  drama: Anime[];
  action: Anime[];
  comedy: Anime[];
}

export function SeriesModeLayout({
  trending,
  crime,
  drama,
  action,
  comedy,
}: SeriesModeLayoutProps) {
  const spotlight = trending.length > 0 ? trending.slice(0, 5) : crime.slice(0, 5);
  const hasSpotlight = spotlight.length > 0;

  return (
    <div className={hasSpotlight ? "-mt-16 pb-12 animate-fade-in" : "pt-4 pb-12 animate-fade-in"}>
      {hasSpotlight && <HeroSpotlight items={spotlight} mode="series" />}

      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <div className="mx-auto w-full max-w-7xl px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider sm:text-3xl text-foreground flex items-center gap-2.5">
              <span className="inline-block h-6 w-1.5 rounded bg-emerald-500" />
              TV Series & Shows Mode
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Binge-watch trending multi-season television shows, crime sagas, acclaimed dramas, and sitcoms.
            </p>
          </div>
        </div>

        <ContinueWatching />

        {trending.length > 0 && (
          <AnimeRow
            title="Top 10 Binge-Worthy TV Shows Today"
            items={trending.slice(0, 10)}
            href="/search?q=series"
            numbered
            mode="series"
          />
        )}

        {crime.length > 0 && (
          <AnimeRow
            title="Crime, Mystery & Detective Sagas"
            items={crime}
            href="/search?q=crime%20series"
            mode="series"
          />
        )}

        {drama.length > 0 && (
          <AnimeRow
            title="Critically Acclaimed Drama Series"
            items={drama}
            href="/search?q=drama%20series"
            mode="series"
          />
        )}

        {action.length > 0 && (
          <AnimeRow
            title="Action, Supernatural & Sci-Fi Shows"
            items={action}
            href="/search?q=action%20series"
            mode="series"
          />
        )}

        {comedy.length > 0 && (
          <AnimeRow
            title="Comedy Series, Sitcoms & Parodies"
            items={comedy}
            href="/search?q=comedy%20series"
            mode="series"
          />
        )}
      </div>
    </div>
  );
}
