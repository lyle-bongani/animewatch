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

  const spotlight = trending.slice(0, 5);

  return (
    // Pull up under the sticky nav so the transparent header overlays the billboard
    <div className="-mt-16 pb-12">
      <HeroSpotlight items={spotlight} />

      {/* Netflix-style stack of horizontal carousels */}
      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <ContinueWatching />
        <AnimeRow title="Trending Now" items={trending.slice(0, 10)} href="/search?q=trending" numbered />
        <AnimeRow title="New & Popular This Season" items={airing} href="/search?q=airing" />
        <AnimeRow title="Popular on AnimeWatch" items={popular} href="/search?q=popular" />
        <AnimeRow title="Top Rated" items={topRated} href="/search?q=top" />
        <AnimeRow title="Isekai & Fantasy Worlds" items={isekai} href="/isekai" />

        {/* Recently released episodes (grid keeps the per-episode badges) */}
        <section className="mx-auto w-full max-w-7xl px-4">
          <RecentEpisodes items={recentlyAired} />
        </section>
      </div>
    </div>
  );
}
