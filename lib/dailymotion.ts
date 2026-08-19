export interface DailymotionVideo {
  id: string;
  title: string;
  thumbnail_240_url?: string;
  thumbnail_480_url?: string;
  thumbnail_720_url?: string;
  duration?: number;
  views_total?: number;
  created_time?: number;
  channel?: string;
  owner?: {
    screenname?: string;
    username?: string;
  };
}

export interface DailymotionSearchResponse {
  list: DailymotionVideo[];
  has_more: boolean;
  page: number;
  limit: number;
  total: number;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function formatViews(views?: number): string {
  if (!views) return "0 views";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

export function getDailymotionEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: "0",
    "queue-enable": "0",
    "ui-highlight": "e50914",
  });
  return `https://www.dailymotion.com/embed/video/${videoId}?${params.toString()}`;
}

export async function searchDailymotion(
  query: string,
  limit = 15,
  minMinutes = 3
): Promise<DailymotionVideo[]> {
  try {
    const fields = [
      "id",
      "title",
      "thumbnail_240_url",
      "thumbnail_480_url",
      "thumbnail_720_url",
      "duration",
      "views_total",
      "created_time",
      "channel",
      "owner.screenname",
    ].join(",");

    let url = `https://api.dailymotion.com/videos?search=${encodeURIComponent(
      query
    )}&fields=${fields}&limit=${limit}&flags=no_live`;

    if (minMinutes > 0) {
      url += `&longer_than=${minMinutes}`;
    }

    let res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 1800 }, // 30 min cache
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.error(`Dailymotion API returned HTTP ${res.status}`);
      return [];
    }

    let data = (await res.json()) as DailymotionSearchResponse;
    let list = data.list || [];

    // If longer_than returned 0 results, retry without duration filter as fallback
    if (list.length === 0 && minMinutes > 0) {
      const fallbackUrl = `https://api.dailymotion.com/videos?search=${encodeURIComponent(
        query
      )}&fields=${fields}&limit=${limit}&flags=no_live`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(6000),
      });
      if (fallbackRes.ok) {
        const fallbackData = (await fallbackRes.json()) as DailymotionSearchResponse;
        list = fallbackData.list || [];
      }
    }

    return list;
  } catch (err) {
    console.error("Dailymotion search failed:", err);
    return [];
  }
}
