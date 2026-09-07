import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { getCinemetaSeries } from "@/lib/cinemeta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows & Series - Stream Binge-Worthy TV Hits",
  description: "Watch trending TV series, crime dramas, comedies, sci-fi shows, and multi-season sagas in HD.",
};

export default async function SeriesPage() {
  const [trending, crime, drama, action, comedy] = await Promise.all([
    getCinemetaSeries(undefined, 20),
    getCinemetaSeries("Crime", 20),
    getCinemetaSeries("Drama", 20),
    getCinemetaSeries("Action", 20),
    getCinemetaSeries("Comedy", 20),
  ]);

  const spotlight = trending.length > 0 ? trending.slice(0, 5) : crime.slice(0, 5);
  const hasSpotlight = spotlight.length > 0;

  return (
    <div className={hasSpotlight ? "-mt-16 pb-12" : "pt-4 pb-12"}>
      {hasSpotlight && <HeroSpotlight items={spotlight} />}

      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider sm:text-3xl text-foreground">
            <span className="mr-2.5 inline-block h-6 w-1.5 rounded bg-accent align-middle" />
            TV Shows & Series
          </h1>
          <p className="mt-1 text-sm text-muted">
            Discover trending television series, crime sagas, acclaimed dramas, and binge-worthy multi-season shows.
          </p>
        </div>

        {trending.length > 0 && (
          <AnimeRow
            title="Top & Trending TV Shows"
            items={trending}
            href="/search?q=series"
            numbered
          />
        )}
        {crime.length > 0 && (
          <AnimeRow
            title="Crime & Mystery Sagas"
            items={crime}
            href="/search?q=crime%20series"
          />
        )}
        {drama.length > 0 && (
          <AnimeRow
            title="Drama & Acclaimed Series"
            items={drama}
            href="/search?q=drama%20series"
          />
        )}
        {action.length > 0 && (
          <AnimeRow
            title="Action & Sci-Fi Series"
            items={action}
            href="/search?q=action%20series"
          />
        )}
        {comedy.length > 0 && (
          <AnimeRow
            title="Comedy Series & Sitcoms"
            items={comedy}
            href="/search?q=comedy%20series"
          />
        )}
      </div>
    </div>
  );
}
