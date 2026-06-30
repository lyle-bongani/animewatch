import { HeroSpotlight } from "@/components/HeroSpotlight";
import { DonghuaTabs } from "@/components/DonghuaTabs";
import { getDonghuaBySort } from "@/lib/anilist";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chinese Anime (Donghua) - AnimeWatch",
  description: "Explore the best of Chinese 2D & 3D animation (Donghua). Stream popular series like Soul Land, Link Click, and Battle Through the Heavens.",
};

export default async function DonghuaPage() {
  // Fetch initial content for SEO and fast initial paint
  const [trending, popular2D, popular3D, ongoing] = await Promise.all([
    getDonghuaBySort(["TRENDING_DESC"], 5),
    getDonghuaBySort(["POPULARITY_DESC"], 20, { is3D: false }),
    getDonghuaBySort(["POPULARITY_DESC"], 20, { is3D: true }),
    getDonghuaBySort(["POPULARITY_DESC"], 20, { status: "RELEASING" }),
  ]);

  return (
    // Pull up under the sticky nav so the transparent header overlays the billboard
    <div className="-mt-16 pb-12">
      <HeroSpotlight items={trending} />

      {/* Netflix-style stack of tabbed directories */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-8 sm:px-8">
        <h2 className="mb-6 text-xl font-bold uppercase tracking-wider sm:text-2xl">
          <span className="mr-2.5 inline-block h-5 w-1.5 rounded bg-accent align-middle" />
          Chinese Anime (Donghua)
        </h2>
        
        <DonghuaTabs
          popular2D={popular2D}
          popular3D={popular3D}
          ongoing={ongoing}
        />
      </div>
    </div>
  );
}
