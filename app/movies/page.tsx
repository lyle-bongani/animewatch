import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { getMoviesBySort } from "@/lib/anilist";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Movies - Stream Feature Films & Masterpieces",
  description: "Watch the best animated feature films, trending theatrical releases, and classic anime movies on AnimeWatch.",
};

export default async function MoviesPage() {
  const [trending, popular, topRated, latest] = await Promise.all([
    getMoviesBySort(["TRENDING_DESC", "POPULARITY_DESC"], 18),
    getMoviesBySort(["POPULARITY_DESC"], 18),
    getMoviesBySort(["SCORE_DESC"], 18),
    getMoviesBySort(["START_DATE_DESC"], 18),
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
            Anime Movies & Theatrical Films
          </h1>
          <p className="mt-1 text-sm text-muted">
            Explore animated feature films, award-winning cinematic releases, and classic masterpieces.
          </p>
        </div>

        {trending.length > 0 && (
          <AnimeRow
            title="Trending Movies"
            items={trending}
            href="/search?format=MOVIE&sort=TRENDING_DESC"
            numbered
          />
        )}
        {popular.length > 0 && (
          <AnimeRow
            title="All-Time Popular Movies"
            items={popular}
            href="/search?format=MOVIE&sort=POPULARITY_DESC"
          />
        )}
        {topRated.length > 0 && (
          <AnimeRow
            title="Critically Acclaimed Masterpieces"
            items={topRated}
            href="/search?format=MOVIE&sort=SCORE_DESC"
          />
        )}
        {latest.length > 0 && (
          <AnimeRow
            title="Recent Movie Releases"
            items={latest}
            href="/search?format=MOVIE&sort=START_DATE_DESC"
          />
        )}
      </div>
    </div>
  );
}
