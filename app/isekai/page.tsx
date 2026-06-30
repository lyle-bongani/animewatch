import { HeroSpotlight } from "@/components/HeroSpotlight";
import { AnimeRow } from "@/components/AnimeRow";
import { getIsekaiBySort, getOngoingIsekai } from "@/lib/anilist";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Isekai - Explore Other Worlds",
  description: "Browse the latest, most popular, ongoing, and trending Isekai anime only on AnimeWatch.",
};

export default async function IsekaiPage() {
  const [trending, popular, latest, ongoing] = await Promise.all([
    getIsekaiBySort(["TRENDING_DESC"], 18),
    getIsekaiBySort(["POPULARITY_DESC"], 18),
    getIsekaiBySort(["START_DATE_DESC"], 18),
    getOngoingIsekai(18),
  ]);

  const spotlight = trending.slice(0, 5);

  return (
    // Pull up under the sticky nav so the transparent header overlays the billboard
    <div className="-mt-16 pb-12">
      <HeroSpotlight items={spotlight} />

      {/* Netflix-style stack of horizontal carousels */}
      <div className="relative z-10 flex flex-col gap-8 pt-8 sm:gap-12">
        <AnimeRow title="Ongoing Isekai Series" items={ongoing} />
        <AnimeRow title="Latest Isekai Releases" items={latest} />
        <AnimeRow title="Trending Isekai" items={trending} numbered />
        <AnimeRow title="Most Popular Isekai" items={popular} />
      </div>
    </div>
  );
}
