import Link from "next/link";
import { ALL_GENRES } from "@/lib/genres";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Genres & Categories - AnimeWatch",
  description: "Explore anime, donghua, and series by genres including Action, Fantasy, Drama, Slice of Life, Adventure, Comedy, Romance, and more.",
};

export default function GenresPage() {
  const featured = ALL_GENRES.filter((g) => g.featured);
  const sorted = [...ALL_GENRES].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          <span className="mr-3 inline-block h-8 w-2 rounded bg-accent align-middle" />
          Browse by Genre
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
          Discover titles categorized by storytelling styles, world-building, themes, and demographics.
        </p>
      </div>

      {/* Featured Genres Highlight Grid */}
      <section className="mb-14">
        <h2 className="mb-5 text-lg font-bold uppercase tracking-wider text-muted">
          Popular & Spotlight Categories
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((g) => (
            <Link
              key={g.name}
              href={g.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface p-6 shadow-md transition-all hover:border-accent hover:shadow-xl hover:shadow-accent/5 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                    {g.name}
                  </h3>
                  <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                    {g.tag}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                  {g.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-accent group-hover:underline">
                Explore {g.name}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Complete A-Z Directory */}
      <section>
        <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold uppercase tracking-wider text-muted">
            All Genres (A to Z)
          </h2>
          <span className="text-xs text-muted font-semibold">
            {ALL_GENRES.length} Categories
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map((g) => (
            <Link
              key={g.name}
              href={g.href}
              className="group flex flex-col justify-between rounded-xl border border-border/60 bg-surface-2/70 p-3.5 transition-all hover:border-accent/60 hover:bg-surface-3 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
                    {g.name}
                  </span>
                </div>
                <span className="mt-1 inline-block text-[10px] font-semibold text-muted uppercase tracking-wider">
                  {g.tag}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] text-muted/80 leading-snug">
                {g.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
