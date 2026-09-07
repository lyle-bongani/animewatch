import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { getCinemetaMovies } from "@/lib/cinemeta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies - Stream Hollywood & Global Blockbusters",
  description: "Watch trending Hollywood movies, action blockbusters, comedies, sci-fi sagas, and critically acclaimed films in HD.",
};

export default async function MoviesPage() {
  const [trending, action, scifi, drama, comedy] = await Promise.all([
    getCinemetaMovies(undefined, 20),
    getCinemetaMovies("Action", 20),
    getCinemetaMovies("Sci-Fi", 20),
    getCinemetaMovies("Drama", 20),
    getCinemetaMovies("Comedy", 20),
  ]);

  const spotlight = trending.length > 0 ? trending.slice(0, 5) : action.slice(0, 5);
  const hasSpotlight = spotlight.length > 0;

  return (
    <div className={hasSpotlight ? "-mt-16 pb-12" : "pt-4 pb-12"}>
      {hasSpotlight && <HeroSpotlight items={spotlight} />}

      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider sm:text-3xl text-foreground">
            <span className="mr-2.5 inline-block h-6 w-1.5 rounded bg-accent align-middle" />
            Movies & Blockbusters
          </h1>
          <p className="mt-1 text-sm text-muted">
            Explore trending theatrical releases, action blockbusters, award-winning dramas, and classic cinema.
          </p>
        </div>

        {trending.length > 0 && (
          <AnimeRow
            title="Top & Trending Movies"
            items={trending}
            href="/search?q=movies"
            numbered
          />
        )}
        {action.length > 0 && (
          <AnimeRow
            title="Action & Adventure Blockbusters"
            items={action}
            href="/search?q=action%20movies"
          />
        )}
        {scifi.length > 0 && (
          <AnimeRow
            title="Sci-Fi & Fantasy Movies"
            items={scifi}
            href="/search?q=scifi%20movies"
          />
        )}
        {drama.length > 0 && (
          <AnimeRow
            title="Drama & Thriller Masterpieces"
            items={drama}
            href="/search?q=drama%20movies"
          />
        )}
        {comedy.length > 0 && (
          <AnimeRow
            title="Comedy & Feel-Good Hits"
            items={comedy}
            href="/search?q=comedy%20movies"
          />
        )}
      </div>
    </div>
  );
}
