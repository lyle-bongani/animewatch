"use client";

import React from "react";
import { useAppMode, APP_MODES, type AppMode } from "@/components/ModeContext";
import { AnimeModeLayout } from "@/components/modes/AnimeModeLayout";
import { MoviesModeLayout } from "@/components/modes/MoviesModeLayout";
import { SeriesModeLayout } from "@/components/modes/SeriesModeLayout";
import { MangaModeLayout } from "@/components/modes/MangaModeLayout";
import type { Anime } from "@/lib/types";
import type { AiringScheduleItem } from "@/lib/anilist";
import type { AsuraSeriesCard } from "@/lib/asura";

interface AdaptiveHomeProps {
  animeData: {
    trending: Anime[];
    popular: Anime[];
    topRated: Anime[];
    airing: Anime[];
    recentlyAired: AiringScheduleItem[];
    isekai: Anime[];
  };
  moviesData: {
    trending: Anime[];
    action: Anime[];
    scifi: Anime[];
    drama: Anime[];
    comedy: Anime[];
  };
  seriesData: {
    trending: Anime[];
    crime: Anime[];
    drama: Anime[];
    action: Anime[];
    comedy: Anime[];
  };
  mangaData: {
    comics: AsuraSeriesCard[];
  };
}

export function AdaptiveHome({
  animeData,
  moviesData,
  seriesData,
  mangaData,
}: AdaptiveHomeProps) {
  const { mode, setMode } = useAppMode();

  return (
    <div className="w-full transition-all duration-300">
      {/* Active Layout based on current App Mode */}
      {mode === "anime" && (
        <AnimeModeLayout
          trending={animeData.trending}
          popular={animeData.popular}
          topRated={animeData.topRated}
          airing={animeData.airing}
          recentlyAired={animeData.recentlyAired}
          isekai={animeData.isekai}
        />
      )}

      {mode === "movies" && (
        <MoviesModeLayout
          trending={moviesData.trending}
          action={moviesData.action}
          scifi={moviesData.scifi}
          drama={moviesData.drama}
          comedy={moviesData.comedy}
        />
      )}

      {mode === "series" && (
        <SeriesModeLayout
          trending={seriesData.trending}
          crime={seriesData.crime}
          drama={seriesData.drama}
          action={seriesData.action}
          comedy={seriesData.comedy}
        />
      )}

      {mode === "manga" && (
        <MangaModeLayout comics={mangaData.comics} />
      )}
    </div>
  );
}
