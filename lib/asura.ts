export interface AsuraSeriesCard {
  slug: string;
  title: string;
  cover: string;
  latestChapter?: string;
  rating?: string;
}

export interface AsuraChapter {
  number: string;
  title?: string;
  url: string;
  publishedAt?: string;
}

export interface AsuraComicDetail {
  slug: string;
  title: string;
  cover: string;
  banner?: string;
  synopsis: string;
  status: string;
  genres: string[];
  chapters: AsuraChapter[];
}

export interface AsuraChapterData {
  slug: string;
  chapter: string;
  title?: string;
  seriesTitle?: string;
  pages: string[];
  prevChapter?: string | null;
  nextChapter?: string | null;
}

const BASE_URL = "https://asurascans.com";

function cleanHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** Fetches latest updated series from AsuraScans homepage or browse feed */
export async function getAsuraLatest(page = 1): Promise<AsuraSeriesCard[]> {
  try {
    const url = page === 1 ? BASE_URL : `${BASE_URL}/browse?page=${page}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
      },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`AsuraScans returned HTTP ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Map any chapter links present on the page to their slug
    const chRegex = /href=[\"']\/comics\/([a-zA-Z0-9_-]+)\/chapter\/([0-9.]+)[\"']/gi;
    const latestChMap = new Map<string, string>();
    let chM;
    while ((chM = chRegex.exec(html)) !== null) {
      const slug = chM[1];
      const num = chM[2];
      if (!latestChMap.has(slug)) {
        latestChMap.set(slug, num);
      } else {
        const existing = parseFloat(latestChMap.get(slug)!);
        const current = parseFloat(num);
        if (!isNaN(current) && (isNaN(existing) || current > existing)) {
          latestChMap.set(slug, num);
        }
      }
    }

    const items: AsuraSeriesCard[] = [];
    const regex = /<a[^>]+href=[\"']\/comics\/([a-zA-Z0-9_-]+)[\"'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const slug = match[1];
      const inner = match[2];

      const imgMatch = inner.match(/src=[\"']([^\"']+\.webp[^\"']*)[\"']/i);
      const titleMatch =
        inner.match(/<h3[^>]*class=[\"'][^\"']*font-bold[^\"']*[\"'][^>]*>([^<]+)<\/h3>/i) ||
        inner.match(/<span[^>]*class=[\"'][^\"']*font-bold[^\"']*[\"'][^>]*>([^<]+)<\/span>/i) ||
        inner.match(/alt=[\"']([^\"']+)[\"']/i);

      const ratingMatch = inner.match(/<span[^>]*class=[\"'][^\"']*(?:font-semibold|text-white)[^\"']*[\"'][^>]*>([0-9.]+)<\/span>/i);
      const inlineChMatch = inner.match(/Chapter\s*(?:<!--\s*-->)?\s*([0-9.]+)/i);

      if (imgMatch && titleMatch) {
        items.push({
          slug,
          title: cleanHtml(titleMatch[1]),
          cover: imgMatch[1],
          latestChapter: latestChMap.get(slug) || (inlineChMatch ? inlineChMatch[1] : undefined),
          rating: ratingMatch ? ratingMatch[1] : undefined,
        });
      }
    }

    const unique: AsuraSeriesCard[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      if (!seen.has(item.slug)) {
        seen.add(item.slug);
        unique.push(item);
      }
    }

    return unique;
  } catch (err) {
    console.error("Failed to fetch AsuraScans latest:", err);
    return [];
  }
}

/** Searches series by query on AsuraScans */
export async function searchAsura(query: string): Promise<AsuraSeriesCard[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const res = await fetch(`${BASE_URL}/browse?search=${encodeURIComponent(q)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const items: AsuraSeriesCard[] = [];
    const regex = /<a[^>]+href=[\"']\/comics\/([a-zA-Z0-9_-]+)[\"'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const slug = match[1];
      const inner = match[2];

      const imgMatch = inner.match(/src=[\"']([^\"']+\.webp[^\"']*)[\"']/i);
      const titleMatch =
        inner.match(/<span[^>]*class=[\"'][^\"']*font-bold[^\"']*[\"'][^>]*>([^<]+)<\/span>/i) ||
        inner.match(/alt=[\"']([^\"']+)[\"']/i);
      const chMatch = inner.match(/Chapter\s*(?:<!--\s*-->)?\s*([0-9.]+)/i);

      if (imgMatch && titleMatch) {
        items.push({
          slug,
          title: cleanHtml(titleMatch[1]),
          cover: imgMatch[1],
          latestChapter: chMatch ? chMatch[1] : undefined,
        });
      }
    }

    const unique: AsuraSeriesCard[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      if (!seen.has(item.slug)) {
        seen.add(item.slug);
        unique.push(item);
      }
    }

    return unique;
  } catch (err) {
    console.error("Failed to search AsuraScans:", err);
    return [];
  }
}

/** Fetches full series details, synopsis, genres, and all chapters */
export async function getAsuraComic(slug: string): Promise<AsuraComicDetail | null> {
  try {
    const res = await fetch(`${BASE_URL}/comics/${encodeURIComponent(slug)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const html = await res.text();

    // 1. Title
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? cleanHtml(titleMatch[1]) : slug.replace(/-[0-9a-f]+$/i, "").replace(/-/g, " ");

    // 2. Cover
    const coverMatch =
      html.match(/src=[\"'](https?:\/\/cdn\.asurascans\.com\/asura-images\/covers\/[^\"']+)[\"']/i) ||
      html.match(/src=[\"'](https?:\/\/[^\"']*covers[^\"']+)[\"']/i);
    const cover = coverMatch ? coverMatch[1] : "";

    // 3. Synopsis
    const descMatch =
      html.match(/id=[\"']description-text[\"'][^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/<p[^>]*class=[\"'][^\"']*prose[^\"']*[\"'][^>]*>([\s\S]*?)<\/p>/i);
    const synopsis = descMatch ? cleanHtml(descMatch[1]) : "No synopsis available.";

    // 4. Genres
    const genres: string[] = [];
    const genreRegex = /href=[\"']\/browse\?genres=[^\"']+[\"'][^>]*>([\s\S]*?)<\/a>/gi;
    let gMatch;
    while ((gMatch = genreRegex.exec(html)) !== null) {
      const gName = cleanHtml(gMatch[1]);
      if (gName && !genres.includes(gName)) {
        genres.push(gName);
      }
    }

    // 5. Status
    let status = "Ongoing";
    if (html.includes("Completed") || html.includes("completed")) {
      status = "Completed";
    }

    // 6. Chapters list
    const chapters: AsuraChapter[] = [];
    const chRegex =
      /href=[\"']\/comics\/[a-zA-Z0-9_-]+\/chapter\/([0-9.]+)[\"'][^>]*>([\s\S]*?)<\/a>/gi;
    let chM;
    const seenCh = new Set<string>();

    while ((chM = chRegex.exec(html)) !== null) {
      const num = chM[1];
      if (seenCh.has(num)) continue;
      seenCh.add(num);

      const chInner = chM[2];
      const dateMatch = chInner.match(
        /<span[^>]*class=[\"'][^\"']*(?:text-white\/40|text-muted|truncate)[^\"']*[\"'][^>]*>([\s\S]*?)<\/span>/i
      );

      chapters.push({
        number: num,
        url: `/manga/${slug}/chapter/${num}`,
        publishedAt: dateMatch ? cleanHtml(dateMatch[1]) : undefined,
      });
    }

    // Sort chapters by number ascending (e.g. 1, 2, 3... 159)
    chapters.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

    return {
      slug,
      title,
      cover,
      banner: cover,
      synopsis,
      status,
      genres: genres.length > 0 ? genres : ["Manhwa", "Action", "Fantasy"],
      chapters,
    };
  } catch (err) {
    console.error(`Failed to fetch Asura comic ${slug}:`, err);
    return null;
  }
}

/** Fetches chapter page images for reading */
export async function getAsuraChapterPages(
  slug: string,
  chapter: string
): Promise<AsuraChapterData | null> {
  try {
    const res = await fetch(`${BASE_URL}/comics/${encodeURIComponent(slug)}/chapter/${encodeURIComponent(chapter)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const html = await res.text();

    // 1. Series title
    const seriesTitleMatch =
      html.match(/<a[^>]+href=[\"']\/comics\/[a-zA-Z0-9_-]+[\"'][^>]*>[\s\S]*?<h3[^>]*class=[\"'][^\"']*font-bold[^\"']*[\"'][^>]*>([^<]+)<\/h3>/i) ||
      html.match(/<title>([\s\S]*?)\s+Chapter\s+[0-9.]+/i) ||
      html.match(/<title>([\s\S]*?)(?:Chapter|- Asura)<\/title>/i);
    const seriesTitle = seriesTitleMatch ? cleanHtml(seriesTitleMatch[1]) : undefined;

    // 2. Extract pages (from JSON pages block or directly from img src)
    const pages: string[] = [];
    const seen = new Set<string>();

    // Try finding JSON pages block
    const jsonMatch = html.match(/&quot;pages&quot;:\s*\[1,\s*(\[[\s\S]*?\])\]/i);
    if (jsonMatch) {
      try {
        const unescaped = jsonMatch[1].replace(/&quot;/g, '"');
        const parsed = JSON.parse(unescaped);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const pageObj = Array.isArray(item) ? item[1] : item;
            const url = pageObj?.url ? (Array.isArray(pageObj.url) ? pageObj.url[1] : pageObj.url) : null;
            if (url && typeof url === "string" && !seen.has(url)) {
              seen.add(url);
              pages.push(url);
            }
          }
        }
      } catch {
        /* fallback to regex */
      }
    }

    // Fallback: extract all cdn chapter img tags
    if (pages.length === 0) {
      const imgRegex = /src=[\"'](https?:\/\/cdn\.asurascans\.com\/asura-images\/chapters\/[^\"']+)[\"']/gi;
      let imgM;
      while ((imgM = imgRegex.exec(html)) !== null) {
        const url = imgM[1];
        if (!seen.has(url)) {
          seen.add(url);
          pages.push(url);
        }
      }
    }

    // 3. Prev and Next chapters from navigation links
    let prevChapter: string | null = null;
    let nextChapter: string | null = null;

    const currentNum = parseFloat(chapter);
    if (!isNaN(currentNum)) {
      const prevCandidate = String(currentNum - 1);
      const nextCandidate = String(currentNum + 1);

      if (html.includes(`/chapter/${nextCandidate}`)) {
        nextChapter = nextCandidate;
      }
      if (html.includes(`/chapter/${prevCandidate}`) && currentNum > 1) {
        prevChapter = prevCandidate;
      }
    }

    return {
      slug,
      chapter,
      seriesTitle,
      pages,
      prevChapter,
      nextChapter,
    };
  } catch (err) {
    console.error(`Failed to fetch chapter pages (${slug} Ch.${chapter}):`, err);
    return null;
  }
}
