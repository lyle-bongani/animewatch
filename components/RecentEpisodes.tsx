import Link from "next/link";
import type { AiringScheduleItem } from "@/lib/anilist";
import { displayTitle, formatLabel } from "@/lib/types";

export function RecentEpisodes({ items }: { items: AiringScheduleItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">
          <span className="mr-2 inline-block h-5 w-1 rounded bg-accent align-middle" />
          Recently Updated
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item, idx) => {
          const anime = item.media;
          const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
          
          return (
            <Link
              key={`${anime.id}-${item.episode}-${idx}`}
              href={`/watch/${anime.id}?ep=${item.episode}`}
              className="group block focus:outline-none"
              title={`${displayTitle(anime)} — Episode ${item.episode}`}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition-all group-hover:ring-accent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={anime.coverImage.extraLarge ?? anime.coverImage.large ?? ""}
                  alt={displayTitle(anime)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />

                {score && (
                  <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur">
                    ★ {score}
                  </span>
                )}
                
                <span className="absolute right-2 top-2 rounded-md bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white shadow-md">
                  EP {item.episode}
                </span>

                <span className="absolute inset-x-0 bottom-0 translate-y-2 p-3 text-xs text-white/90 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  {[formatLabel(anime.format), anime.seasonYear].filter(Boolean).join(" · ")}
                </span>
              </div>

              <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
                {displayTitle(anime)}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
