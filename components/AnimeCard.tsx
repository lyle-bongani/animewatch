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
import { useAdultGate } from "./AdultGateContext";

export function AnimeCard({ anime }: { anime: Anime }) {
  const { isAdultUnlocked, openModal } = useAdultGate();
  const isAdultContent = isStraight18(anime);
  const isLocked = isAdultContent && !isAdultUnlocked;

  const match = matchPercent(anime);
  const maturity = maturityLabel(anime);
  const ep = anime.nextAiringEpisode?.episode
    ? anime.nextAiringEpisode.episode - 1
    : anime.episodes;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      openModal();
    }
  };

  return (
    <Link
      href={`/anime/${anime.id}`}
      onClick={handleClick}
      className="netflix-card group block focus:outline-none"
      title={displayTitle(anime)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-border shadow-md transition-all group-hover:ring-accent group-hover:shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.coverImage.extraLarge ?? anime.coverImage.large ?? ""}
          alt={displayTitle(anime)}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLocked ? "blur-xl brightness-50 scale-105" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* 2D/3D Donghua Badge */}
        {anime.countryOfOrigin === "CN" && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white border border-white/20 backdrop-blur-sm shadow-md">
            {is3D(anime) ? "3D Donghua" : "2D Donghua"}
          </span>
        )}

        {/* Locked Overlay if Straight 18+ and Safe Mode is Active */}
        {isLocked ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 border border-white/20 text-accent shadow-md backdrop-blur-md">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <span className="mt-2 rounded-md bg-accent/90 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white border border-white/20 backdrop-blur-sm shadow-md">
              18+ Locked
            </span>
            <span className="mt-1 text-[10px] font-medium text-zinc-300 underline underline-offset-2">
              Unlock
            </span>
          </div>
        ) : (
          /* Episode badge */
          !!ep && (
            <span className="absolute right-2.5 top-2.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md shadow-accent/25">
              EP {ep}
            </span>
          )
        )}

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3 text-white">
          <h3 className="type-row line-clamp-2 text-xs group-hover:text-accent transition-colors sm:text-sm">
            {displayTitle(anime)}
          </h3>

          {/* Detail strip — hidden while browsing, revealed on hover */}
          <div className="mt-1.5 flex max-h-0 flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden text-[9px] opacity-0 transition-all duration-300 group-hover:mt-2 group-hover:max-h-16 group-hover:opacity-100 sm:text-[10px]">
            {match != null && (
              <span className="font-bold text-[color:var(--color-match)]">{match}% Match</span>
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
