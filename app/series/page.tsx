import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { getSeriesBySort } from "@/lib/anilist";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Series - Stream TV Shows & Multi-Season Series",
  description: "Browse the latest and most popular anime TV series, ongoing weekly releases, and classic anime shows on AnimeWatch.",
};

export default async function SeriesPage() {
  const [ongoing, trending, popular, topRated] = await Promise.all([
    getSeriesBySort(["TRENDING_DESC"], 18, "RELEASING"),
    getSeriesBySort(["TRENDING_DESC", "POPULARITY_DESC"], 18),
    getSeriesBySort(["POPULARITY_DESC"], 18),
    getSeriesBySort(["SCORE_DESC"], 18),
  ]);

  const spotlight = trending.length > 0 ? trending.slice(0, 5) : popular.slice(0, 5);
  const hasSpotlight = spotlight.length > 0;

  return (
    <div className={hasSpotlight ? "-mt-16 pb-12" : "pt-4 pb-12"}>
      {hasSpotlight && <HeroSpotlight items={spotlight} />}

      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider sm:text-3xl text-foreground">
            <span className="mr-2.5 inline-block h-6 w-1.5 rounded bg-accent align-middle" />
            Anime TV Series
          </h1>
          <p className="mt-1 text-sm text-muted">
            Discover ongoing anime series, new season premieres, and complete binge-worthy sagas.
          </p>
        </div>

        {ongoing.length > 0 && (
          <AnimeRow
            title="Currently Airing Series"
            items={ongoing}
            href="/search?format=TV&status=RELEASING"
          />
        )}
        {trending.length > 0 && (
          <AnimeRow
            title="Trending Series"
            items={trending}
            href="/search?format=TV&sort=TRENDING_DESC"
            numbered
          />
        )}
        {popular.length > 0 && (
          <AnimeRow
            title="All-Time Most Popular Series"
            items={popular}
            href="/search?format=TV&sort=POPULARITY_DESC"
          />
        )}
        {topRated.length > 0 && (
          <AnimeRow
            title="Top Rated TV Series"
            items={topRated}
            href="/search?format=TV&sort=SCORE_DESC"
          />
        )}
      </div>
    </div>
  );
}
