import Link from "next/link";
import type { Anime } from "@/lib/types";
import { displayTitle, formatLabel } from "@/lib/types";

export function AnimeCard({ anime }: { anime: Anime }) {
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const sub = anime.nextAiringEpisode?.episode
    ? anime.nextAiringEpisode.episode - 1
    : anime.episodes;

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group block focus:outline-none"
      title={displayTitle(anime)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border shadow-md transition-all group-hover:ring-accent group-hover:shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.coverImage.extraLarge ?? anime.coverImage.large ?? ""}
          alt={displayTitle(anime)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Bottom Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* Score Badge */}
        {score && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-400 backdrop-blur">
            ★ {score}
          </span>
        )}
        
        {/* Episode Badge */}
        {!!sub && (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md shadow-accent/25">
            EP {sub}
          </span>
        )}

        {/* Content overlay at the bottom */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end text-white">
          <h3 className="line-clamp-2 text-xs font-bold leading-snug group-hover:text-accent transition-colors sm:text-sm">
            {displayTitle(anime)}
          </h3>
          <p className="mt-1 text-[9px] text-zinc-300 font-medium sm:text-[10px]">
            {[formatLabel(anime.format), anime.seasonYear].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
