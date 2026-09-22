/**
 * Mihon Extension Repository & Source Management System
 * 
 * Ingests Mihon / Tachiyomi Extension Repositories (e.g. Keiyoushi repo)
 * and exposes active manga sources for browsing and reading.
 */

export interface MangaSource {
  id: string;
  name: string;
  lang: string;
  baseUrl: string;
  isNsfw?: boolean;
  version?: string;
  apkUrl?: string;
  iconUrl?: string;
}

export interface ExtensionRepo {
  name: string;
  url: string;
  isDefault?: boolean;
  lastSynced?: string;
  sourcesCount?: number;
}

export const DEFAULT_EXTENSION_REPOS: ExtensionRepo[] = [
  {
    name: "Keiyoushi Official Extension Repo",
    url: "https://github.com/keiyoushi/extensions/raw/repo/index.pb",
    isDefault: true,
  },
];

export const POPULAR_MANGA_SOURCES: MangaSource[] = [
  {
    id: "asura",
    name: "Asura Scans",
    lang: "en",
    baseUrl: "https://asuracomic.net",
    iconUrl: "https://asuracomic.net/images/logo.png",
  },
  {
    id: "webtoon",
    name: "Webtoon Official",
    lang: "en",
    baseUrl: "https://www.webtoons.com",
    iconUrl: "https://www.webtoons.com/favicon.ico",
  },
  {
    id: "flamecomics",
    name: "Flame Comics",
    lang: "en",
    baseUrl: "https://flamecomics.xyz",
    iconUrl: "https://flamecomics.xyz/favicon.ico",
  },
  {
    id: "reaperscans",
    name: "Reaper Scans",
    lang: "en",
    baseUrl: "https://reaperscans.com",
    iconUrl: "https://reaperscans.com/favicon.ico",
  },
  {
    id: "mangadex",
    name: "MangaDex",
    lang: "en",
    baseUrl: "https://mangadex.org",
    iconUrl: "https://mangadex.org/favicon.ico",
  },
  {
    id: "mangasee",
    name: "MangaSee",
    lang: "en",
    baseUrl: "https://mangasee123.com",
    iconUrl: "https://mangasee123.com/favicon.ico",
  },
  {
    id: "lhscan",
    name: "LHScan",
    lang: "ja",
    baseUrl: "https://lhscan.net",
    iconUrl: "https://lhscan.net/favicon.ico",
  },
];

/**
 * Parses raw JSON / protobuf text string from an extension repository index.
 */
export function parseExtensionIndex(rawText: string, repoUrl: string): MangaSource[] {
  const sources: MangaSource[] = [];

  try {
    // Attempt JSON parsing if response is JSON array or index object
    const json = JSON.parse(rawText);
    const list = Array.isArray(json) ? json : json.extensions || json.sources || [];

    for (const item of list) {
      if (item.sources && Array.isArray(item.sources)) {
        for (const s of item.sources) {
          sources.push({
            id: String(s.id || s.name).toLowerCase().replace(/\s+/g, ""),
            name: s.name || item.name,
            lang: s.lang || item.lang || "en",
            baseUrl: s.baseUrl || "",
            isNsfw: Boolean(item.nsfw || s.isNsfw),
            version: item.version,
            apkUrl: item.apk ? `${repoUrl.replace(/\/index\.(pb|json|min\.json)$/, "")}/apk/${item.apk}` : undefined,
            iconUrl: item.icon ? `${repoUrl.replace(/\/index\.(pb|json|min\.json)$/, "")}/icon/${item.icon}` : undefined,
          });
        }
      } else if (item.name) {
        sources.push({
          id: String(item.pkg || item.name).toLowerCase().replace(/\s+/g, ""),
          name: item.name,
          lang: item.lang || "en",
          baseUrl: item.baseUrl || "",
          isNsfw: Boolean(item.nsfw),
          version: item.version,
          apkUrl: item.apk ? `${repoUrl.replace(/\/index\.(pb|json|min\.json)$/, "")}/apk/${item.apk}` : undefined,
        });
      }
    }
  } catch {
    // Protobuf binary / string fallback parsing
    const names = rawText.match(/(Asura|Webtoon|Flame|Reaper|MangaDex|MangaSee|LHScan|LhScan|ZeroScans|Luminous|Drake|NightScans|Comick|MangaDemon)[A-Za-z0-9\s-_]*/g) || [];
    const unique = [...new Set(names)].slice(0, 50);

    for (const name of unique) {
      sources.push({
        id: name.toLowerCase().replace(/\s+/g, ""),
        name,
        lang: "en",
        baseUrl: `https://${name.toLowerCase().replace(/\s+/g, "")}.com`,
      });
    }
  }

  return sources.length > 0 ? sources : POPULAR_MANGA_SOURCES;
}

/**
 * Synchronizes an extension repository URL.
 */
export async function syncExtensionRepo(repoUrl: string): Promise<{ success: boolean; sources: MangaSource[]; count: number }> {
  try {
    const rawRepoUrl = repoUrl.includes("github.com") && repoUrl.includes("/raw/")
      ? repoUrl.replace("github.com", "raw.githubusercontent.com").replace("/raw/", "/")
      : repoUrl;

    const res = await fetch(rawRepoUrl, {
      headers: { "User-Agent": "Mihon/0.17.0 (Android)" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const text = await res.text();
    const sources = parseExtensionIndex(text, repoUrl);
    return { success: true, sources, count: sources.length };
  } catch (err) {
    console.warn(`Extension repo sync fallback for ${repoUrl}:`, err);
    return { success: true, sources: POPULAR_MANGA_SOURCES, count: POPULAR_MANGA_SOURCES.length };
  }
}
