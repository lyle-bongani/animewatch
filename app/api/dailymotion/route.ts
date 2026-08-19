import { NextResponse } from "next/server";
import { searchDailymotion, type DailymotionVideo } from "@/lib/dailymotion";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const ep = url.searchParams.get("ep")?.trim() ?? "";
  const native = url.searchParams.get("native")?.trim() ?? "";

  if (!q && !native) {
    return NextResponse.json({ videos: [], query: "" });
  }

  // 1. Primary search query: "Anime Title episode X"
  const primaryQuery = ep ? `${q} episode ${ep}` : q;
  let videos = await searchDailymotion(primaryQuery, 12);

  // 2. Fallback if no results and episode is provided: try "Anime Title ep X" or native title
  if (videos.length === 0 && ep) {
    const fallbackQuery = `${q} ep ${ep}`;
    videos = await searchDailymotion(fallbackQuery, 10);
  }

  // 3. Fallback to native title if still no results
  if (videos.length === 0 && native && ep) {
    const nativeQuery = `${native} episode ${ep}`;
    videos = await searchDailymotion(nativeQuery, 10);
  }

  // Sort & rank videos: prefer videos that match episode length (> 3 mins or > 180s)
  if (videos.length > 1) {
    videos.sort((a, b) => {
      // Prioritize full length videos (> 3 mins) over previews (< 60s)
      const aIsFull = (a.duration ?? 0) >= 180 ? 1 : 0;
      const bIsFull = (b.duration ?? 0) >= 180 ? 1 : 0;
      if (aIsFull !== bIsFull) return bIsFull - aIsFull;

      // Then by views
      return (b.views_total ?? 0) - (a.views_total ?? 0);
    });
  }

  return NextResponse.json({
    videos,
    query: primaryQuery,
    total: videos.length,
  });
}
