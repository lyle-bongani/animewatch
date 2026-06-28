import Link from "next/link";
import type { Anime } from "@/lib/types";
import { displayTitle, formatLabel } from "@/lib/types";

export function TopRankings({ items }: { items: Anime[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="h-5 w-1 rounded bg-accent" />
        Top Rankings
      </h2>
      <div className="space-y-4">
        {items.slice(0, 10).map((anime, idx) => {
          const rank = idx + 1;
          const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A";
          
          return (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="flex items-center gap-4 group border-b border-border/40 pb-3 last:border-0 last:pb-0"
            >
              {/* Rank Number */}
              <span
                className={`text-2xl font-black italic shrink-0 w-8 text-center ${
                  rank === 1
                    ? "text-yellow-400"
                    : rank === 2
                    ? "text-zinc-300"
                    : rank === 3
                    ? "text-amber-600"
                    : "text-muted"
                }`}
              >
                {String(rank).padStart(2, "0")}
              </span>

              {/* Cover */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={anime.coverImage.large ?? ""}
                alt=""
                className="h-14 w-10 shrink-0 rounded object-cover ring-1 ring-border"
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-accent transition-colors leading-snug">
                  {displayTitle(anime)}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <span>{formatLabel(anime.format)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-yellow-400/90 font-medium">
                    ★ {score}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
