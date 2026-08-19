import { NextResponse } from "next/server";
import { searchDailymotion, type DailymotionVideo } from "@/lib/dailymotion";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const ep = url.searchParams.get("ep")?.trim() ?? "";
  const native = url.searchParams.get("native")?.trim() ?? "";
  const custom = url.searchParams.get("custom")?.trim() ?? "";

  // 0. If user provided a custom keyword search in the player
  if (custom) {
    const customVideos = await searchDailymotion(custom, 18, 0);
    return NextResponse.json({
      videos: customVideos,
      query: custom,
      total: customVideos.length,
    });
  }

  if (!q && !native) {
    return NextResponse.json({ videos: [], query: "" });
  }

  // Clean title for search: remove special brackets, colons, and season tags that throw off keyword matching
  const cleanTitle = q
    .replace(/\s*\(TV\)\s*/gi, "")
    .replace(/\s*\(Dub\)\s*/gi, "")
    .replace(/[:–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Primary search query: "Anime Title episode X"
  const primaryQuery = ep ? `${cleanTitle} episode ${ep}` : cleanTitle;
  let videos = await searchDailymotion(primaryQuery, 15, 3);

  // 2. Fallback if no results and episode is provided: try "Anime Title ep X"
  if (videos.length === 0 && ep) {
    const fallbackQuery = `${cleanTitle} ep ${ep}`;
    videos = await searchDailymotion(fallbackQuery, 15, 3);
  }

  // 3. Fallback to native title if still no results
  if (videos.length === 0 && native && ep) {
    const nativeQuery = `${native} episode ${ep}`;
    videos = await searchDailymotion(nativeQuery, 15, 3);
  }

  // 4. Broader fallback: "Anime Title X"
  if (videos.length === 0 && ep) {
    const broadQuery = `${cleanTitle} ${ep}`;
    videos = await searchDailymotion(broadQuery, 15, 0);
  }

  // Sort & rank videos: prefer videos that match full episode length (> 3 mins)
  if (videos.length > 1) {
    videos.sort((a, b) => {
      const aIsFull = (a.duration ?? 0) >= 180 ? 1 : 0;
      const bIsFull = (b.duration ?? 0) >= 180 ? 1 : 0;
      if (aIsFull !== bIsFull) return bIsFull - aIsFull;

      return (b.views_total ?? 0) - (a.views_total ?? 0);
    });
  }

  return NextResponse.json({
    videos,
    query: primaryQuery,
    total: videos.length,
  });
}
