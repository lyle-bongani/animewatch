"use client";

import Link from "next/link";
import type { Anime } from "@/lib/types";
import {
  displayTitle,
  formatLabel,
  is3D,
  isStraight18,
  matchPercent,
  maturityLabel,
} from "@/lib/types";

export function AnimeCard({
  anime,
  mode,
}: {
  anime: Anime;
  mode?: "anime" | "movies" | "series";
}) {
  const isAdultContent = isStraight18(anime);
  const match = matchPercent(anime);
  const maturity = maturityLabel(anime);
  const ep = anime.nextAiringEpisode?.episode
    ? anime.nextAiringEpisode.episode - 1
    : anime.episodes;

  const isMovie = mode === "movies" || anime.format === "MOVIE";
  const isSeries = mode === "series" || (anime.streamingEpisodes && anime.streamingEpisodes.length > 1);
  const isChinese = anime.countryOfOrigin === "CN";

  const href = isMovie
    ? `/movies/${anime.id}`
    : isSeries
    ? `/series/${anime.id}`
    : `/anime/${anime.id}`;

  return (
    <Link
      href={href}
      className="netflix-card group block focus:outline-none select-none"
      title={displayTitle(anime)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-border shadow-md transition-all duration-300 group-hover:ring-accent group-hover:shadow-xl">
        {/* Poster Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.coverImage.extraLarge ?? anime.coverImage.large ?? ""}
          alt={displayTitle(anime)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* Top Badges */}
        {isMovie ? (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-accent/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white border border-white/20 backdrop-blur-sm shadow-md">
            Movie
          </span>
        ) : isChinese ? (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-400 border border-amber-400/30 backdrop-blur-sm shadow-md">
            {is3D(anime) ? "3D Donghua" : "2D Donghua"}
          </span>
        ) : isSeries ? (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white border border-white/20 backdrop-blur-sm shadow-md">
            Series
          </span>
        ) : null}

        {/* Episode / Duration badge */}
        {isMovie && anime.duration ? (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[9.5px] font-bold text-zinc-200 shadow-md border border-white/10">
            {anime.duration}m
          </span>
        ) : !!ep ? (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md shadow-accent/30">
            EP {ep}
          </span>
        ) : null}

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-2.5 sm:p-3 text-white">
          <h3 className="type-row line-clamp-2 text-xs font-bold group-hover:text-accent transition-colors sm:text-sm">
            {displayTitle(anime)}
          </h3>

          {/* Detail strip — hidden while browsing, revealed on hover */}
          <div className="mt-1.5 flex max-h-0 flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden text-[9px] opacity-0 transition-all duration-300 group-hover:mt-2 group-hover:max-h-16 group-hover:opacity-100 sm:text-[10px]">
            {match != null && (
              <span className="font-extrabold text-[color:var(--color-match)]">{match}% Match</span>
            )}
            <span
              className={`rounded-sm border px-1 leading-tight ${
                isAdultContent
                  ? "border-accent/60 bg-accent/20 text-accent font-bold"
                  : "border-white/40 text-zinc-200"
              }`}
            >
              {maturity}
            </span>
            <span className="rounded-sm bg-white/15 px-1 leading-tight text-zinc-200">HD</span>
            {anime.duration ? (
              <span className="text-zinc-300">{anime.duration}m</span>
            ) : (
              <span className="text-zinc-300">
                {[formatLabel(anime.format), anime.seasonYear].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
