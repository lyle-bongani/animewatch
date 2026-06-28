import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeGrid } from "@/components/AnimeGrid";
import { ContinueWatching } from "@/components/ContinueWatching";
import { RecentEpisodes } from "@/components/RecentEpisodes";
import { TopRankings } from "@/components/TopRankings";
import { HomeTabs } from "@/components/HomeTabs";
import { getTrending, getPopular, getTopRated, getAiringNow, getRecentlyAired, getIsekai } from "@/lib/anilist";

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
    <div className="pb-12 space-y-10">
      <HeroSpotlight items={spotlight} />

      <ContinueWatching />

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main content area */}
          <div className="flex flex-col gap-12 min-w-0">
            {/* Recently Updated Aired Episodes */}
            <RecentEpisodes items={recentlyAired} />

            {/* Home Tabs Selector (Isekai, Trending, Airing, Top Rated) */}
            <HomeTabs
              isekai={isekai}
              trending={trending}
              airing={airing}
              topRated={topRated}
            />

            {/* Popular Grid */}
            <section>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-xl font-bold sm:text-2xl">
                  <span className="mr-2 inline-block h-5 w-1 rounded bg-accent align-middle" />
                  Popular Anime
                </h2>
              </div>
              <AnimeGrid items={popular} />
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 flex flex-col gap-6">
              <TopRankings items={popular} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

