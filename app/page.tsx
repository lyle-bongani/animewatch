import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { ContinueWatching } from "@/components/ContinueWatching";
import { RecentEpisodes } from "@/components/RecentEpisodes";
import {
  getTrending,
  getPopular,
  getTopRated,
  getAiringNow,
  getRecentlyAired,
  getIsekai,
} from "@/lib/anilist";

export default async function Home() {
  const [trending, popular, topRated, airing, recentlyAired, isekai] = await Promise.all([
    getTrending(20),
    getPopular(18),
    getTopRated(18),
    getAiringNow(18),
    getRecentlyAired(12),
    getIsekai(18),
  ]);

  const spotlight = trending.length > 0 ? trending.slice(0, 5) : popular.slice(0, 5);
  const hasSpotlight = spotlight.length > 0;

  return (
    // Pull up under the sticky nav ONLY when billboard spotlight is rendered
    <div className={hasSpotlight ? "-mt-16 pb-12" : "pt-4 pb-12"}>
      {hasSpotlight && <HeroSpotlight items={spotlight} />}

      {/* Netflix-style stack of horizontal carousels */}
      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <ContinueWatching />
        {trending.length > 0 && (
          <AnimeRow title="Trending Now" items={trending.slice(0, 10)} href="/search?q=trending" numbered />
        )}
        {airing.length > 0 && (
          <AnimeRow title="New & Popular This Season" items={airing} href="/new" />
        )}
        {popular.length > 0 && (
          <AnimeRow title="Popular on AnimeWatch" items={popular} href="/search?q=popular" />
        )}
        {topRated.length > 0 && (
          <AnimeRow title="Top Rated" items={topRated} href="/search?q=top" />
        )}
        {isekai.length > 0 && (
          <AnimeRow title="Isekai & Fantasy Worlds" items={isekai} href="/isekai" />
        )}

        {/* Recently released episodes (grid keeps the per-episode badges) */}
        {recentlyAired.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4">
            <RecentEpisodes items={recentlyAired} />
          </section>
        )}
      </div>
    </div>
  );
}
