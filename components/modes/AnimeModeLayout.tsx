"use client";

import React from "react";
import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { ContinueWatching } from "@/components/ContinueWatching";
import { RecentEpisodes } from "@/components/RecentEpisodes";
import type { Anime } from "@/lib/types";
import type { AiringScheduleItem } from "@/lib/anilist";

interface AnimeModeLayoutProps {
  trending: Anime[];
  popular: Anime[];
  topRated: Anime[];
  airing: Anime[];
  recentlyAired: AiringScheduleItem[];
  isekai: Anime[];
}

export function AnimeModeLayout({
  trending,
  popular,
  topRated,
  airing,
  recentlyAired,
  isekai,
}: AnimeModeLayoutProps) {
  const spotlight = trending.length > 0 ? trending.slice(0, 5) : popular.slice(0, 5);
  const hasSpotlight = spotlight.length > 0;

  return (
    <div className={hasSpotlight ? "-mt-16 pb-12 animate-fade-in" : "pt-4 pb-12 animate-fade-in"}>
      {hasSpotlight && <HeroSpotlight items={spotlight} mode="anime" />}

      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <ContinueWatching />

        {trending.length > 0 && (
          <AnimeRow
            title="Trending Anime in Japan & Global"
            items={trending.slice(0, 10)}
            href="/search?q=trending"
            numbered
            mode="anime"
          />
        )}

        {airing.length > 0 && (
          <AnimeRow
            title="New & Popular This Season"
            items={airing}
            href="/new"
            mode="anime"
          />
        )}

        {popular.length > 0 && (
          <AnimeRow
            title="All-Time Most Popular Anime"
            items={popular}
            href="/search?q=popular"
            mode="anime"
          />
        )}

        {topRated.length > 0 && (
          <AnimeRow
            title="Top Rated Masterpieces"
            items={topRated}
            href="/search?q=top"
            mode="anime"
          />
        )}

        {isekai.length > 0 && (
          <AnimeRow
            title="Isekai, Magic & Fantasy Worlds"
            items={isekai}
            href="/isekai"
            mode="anime"
          />
        )}

        {recentlyAired.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4">
            <RecentEpisodes items={recentlyAired} />
          </section>
        )}
      </div>
    </div>
  );
}
