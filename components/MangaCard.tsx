import Link from "next/link";
import type { AsuraSeriesCard } from "@/lib/asura";

export function MangaCard({ comic }: { comic: AsuraSeriesCard }) {
  return (
    <Link
      href={`/manga/${comic.slug}`}
      className="netflix-card group block focus:outline-none"
      title={comic.title}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-border shadow-md transition-all group-hover:ring-accent group-hover:shadow-lg">
        {/* Poster Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comic.cover}
          alt={comic.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

        {/* Rating Badge */}
        {comic.rating && (
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-white/15 backdrop-blur-sm shadow-md">
            <svg className="h-3 w-3 fill-amber-400" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{comic.rating}</span>
          </div>
        )}

        {/* Latest Chapter Badge */}
        {comic.latestChapter && (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-md shadow-accent/25">
            Ch. {comic.latestChapter}
          </span>
        )}

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3 text-white">
          <h3 className="type-row line-clamp-2 text-xs font-semibold group-hover:text-accent transition-colors sm:text-sm">
            {comic.title}
          </h3>

          <div className="mt-1.5 flex max-h-0 items-center justify-between overflow-hidden text-[10px] text-muted opacity-0 transition-all duration-300 group-hover:max-h-8 group-hover:opacity-100">
            <span className="text-white/80 font-medium">AsuraScans Manhwa</span>
            <span className="text-accent font-semibold flex items-center gap-1">
              Read
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
