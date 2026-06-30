import Link from "next/link";
import type { Anime } from "@/lib/types";
import { displayTitle, formatLabel, is3D, matchPercent, maturityLabel } from "@/lib/types";

export function AnimeCard({ anime }: { anime: Anime }) {
  const match = matchPercent(anime);
  const maturity = maturityLabel(anime);
  const ep = anime.nextAiringEpisode?.episode
    ? anime.nextAiringEpisode.episode - 1
    : anime.episodes;

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="netflix-card group block focus:outline-none"
      title={displayTitle(anime)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-border shadow-md transition-all group-hover:ring-accent group-hover:shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.coverImage.extraLarge ?? anime.coverImage.large ?? ""}
          alt={displayTitle(anime)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* 2D/3D Donghua Badge */}
        {anime.countryOfOrigin === "CN" && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white border border-white/20 backdrop-blur-sm shadow-md">
            {is3D(anime) ? "3D Donghua" : "2D Donghua"}
          </span>
        )}

        {/* Episode badge (always visible while browsing) */}
        {!!ep && (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md shadow-accent/25">
            EP {ep}
          </span>
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
            <span className="rounded-sm border border-white/40 px-1 leading-tight text-zinc-200">
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
