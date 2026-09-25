/**
 * SubsPlease API and Link Helper Utilities
 * Provides functions to construct SubsPlease direct search URLs, show page URLs,
 * and format SubsPlease episode / batch torrent and magnet links.
 */

export interface SubsPleaseDownloadOption {
  quality: "1080p" | "720p" | "480p";
  torrentUrl: string;
  magnetUrl: string;
  fileSize?: string;
}

export interface SubsPleaseEpisode {
  episode: string;
  releaseDate: string;
  downloads: SubsPleaseDownloadOption[];
}

/**
 * Clean anime title for SubsPlease URL slug format
 * Example: "Demon Slayer: Kimetsu no Yaiba" -> "demon-slayer-kimetsu-no-yaiba"
 */
export function sanitizeSubsPleaseSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Generate direct web search URL for SubsPlease
 */
export function getSubsPleaseSearchUrl(title: string, resolution: "1080" | "720" | "480" = "1080"): string {
  return `https://subsplease.org/?s=${encodeURIComponent(title)}&r=${resolution}`;
}

/**
 * Generate direct show page URL on SubsPlease
 */
export function getSubsPleaseShowUrl(title: string): string {
  const slug = sanitizeSubsPleaseSlug(title);
  return `https://subsplease.org/shows/${slug}/`;
}

/**
 * Generate Nyaa search link specifically targeted for SubsPlease releases & batches
 */
export function getSubsPleaseNyaaUrl(title: string, isBatch = false): string {
  const query = isBatch ? `${title} subsplease batch` : `${title} subsplease`;
  return `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(query)}`;
}

/**
 * Fetch latest or show-specific releases directly from SubsPlease JSON API endpoint
 */
export async function fetchSubsPleaseShowData(title: string): Promise<{
  showPageUrl: string;
  searchUrl: string;
  nyaaUrl: string;
  apiData?: Record<string, unknown>;
}> {
  const showPageUrl = getSubsPleaseShowUrl(title);
  const searchUrl = getSubsPleaseSearchUrl(title);
  const nyaaUrl = getSubsPleaseNyaaUrl(title);

  try {
    const res = await fetch(`https://subsplease.org/api/?f=search&s=${encodeURIComponent(title)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (res.ok) {
      const data = await res.json();
      return { showPageUrl, searchUrl, nyaaUrl, apiData: data };
    }
  } catch (err) {
    console.error("SubsPlease API fetch error:", err);
  }

  return { showPageUrl, searchUrl, nyaaUrl };
}
