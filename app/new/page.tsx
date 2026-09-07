import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { RecentEpisodes } from "@/components/RecentEpisodes";
import { getAiringNow, getRecentlyAired, getNewReleases } from "@/lib/anilist";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Anime Releases - Currently Airing This Season",
  description: "Explore the latest anime episodes and newly released titles currently airing this season on AnimeWatch.",
};

export default async function NewReleasesPage() {
  const [airing, recentlyAired, newReleases] = await Promise.all([
    getAiringNow(20),
    getRecentlyAired(18),
    getNewReleases(18),
  ]);

  const spotlight = airing.length > 0 ? airing.slice(0, 5) : newReleases.slice(0, 5);
  const hasSpotlight = spotlight.length > 0;

  return (
    <div className={hasSpotlight ? "-mt-16 pb-12" : "pt-4 pb-12"}>
      {hasSpotlight && <HeroSpotlight items={spotlight} />}

      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider sm:text-3xl text-foreground">
            <span className="mr-2.5 inline-block h-6 w-1.5 rounded bg-accent align-middle" />
            New & Airing Anime
          </h1>
          <p className="mt-1 text-sm text-muted">
            Stay up to date with new anime releases, latest season episodes, and fresh additions.
          </p>
        </div>

        {airing.length > 0 && (
          <AnimeRow
            title="Airing Now This Season"
            items={airing}
            href="/search?status=RELEASING&sort=TRENDING_DESC"
            numbered
          />
        )}

        {recentlyAired.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4">
            <RecentEpisodes items={recentlyAired} />
          </section>
        )}

        {newReleases.length > 0 && (
          <AnimeRow
            title="Freshly Added Titles"
            items={newReleases}
            href="/search?sort=START_DATE_DESC"
          />
        )}
      </div>
    </div>
  );
}
