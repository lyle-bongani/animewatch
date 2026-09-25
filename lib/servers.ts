import type React from "react";

export type AudioType = "sub" | "dub";

export interface EmbedServer {
  /** Stable key used in the URL (?server=). */
  id: string;
  /** Label shown on the server button. */
  name: string;
  /** Whether this provider offers a dub track. */
  supportsDub: boolean;
  /** Whether server is specialized for Chinese Donghua. */
  isDonghuaSpecialist?: boolean;
  /** Whether server is an external search/host player rather than an unblocked inline iframe. */
  isExternalHost?: boolean;
  /** Custom referrer policy for this iframe server if needed */
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  /** Build the iframe src for a given anime/series/movie. */
  build: (params: {
    anilistId?: number | string;
    malId?: number | string | null;
    imdbId?: string | null;
    season?: number;
    episode: number;
    type: AudioType;
    slug: string;
    format?: string | null;
  }) => string;
}

/** Helper: Clean IMDb ID by stripping movie:/series:/anime: prefixes and extracting pure ttXXXXXXX */
function cleanImdb(id?: string | null): string {
  if (!id) return "";
  const cleaned = id.replace(/^(movie|series|anime)[:_-]/i, "").trim();
  const match = cleaned.match(/tt\d+/i);
  return match ? match[0] : cleaned.startsWith("tt") ? cleaned : "";
}

/** Helper: Clean AniList / Numeric ID */
function cleanAniId(id?: number | string | null): string {
  if (!id) return "";
  return String(id).replace(/^ani/i, "").trim();
}

/** Helper: Ensure valid numeric MAL ID */
function getValidMalId(malId?: number | string | null, anilistId?: number | string): string {
  if (malId && !isNaN(Number(malId))) return String(malId);
  if (anilistId && !isNaN(Number(anilistId))) return String(anilistId);
  return cleanAniId(anilistId);
}

export const SERVERS: EmbedServer[] = [
  {
    id: "vidnest",
    name: "HD-1",
    supportsDub: true,
    build: ({ anilistId, imdbId, format, season, episode, type }) => {
      const imdb = cleanImdb(imdbId || (String(anilistId).includes("tt") ? String(anilistId) : null));
      if (imdb) {
        const isMov = format === "MOVIE" || format === "movie";
        return isMov
          ? `https://vidnest.fun/movie/${imdb}`
          : `https://vidnest.fun/tv/${imdb}/${season || 1}/${episode}`;
      }
      return `https://vidnest.fun/anime/${cleanAniId(anilistId)}/${episode}/${type}`;
    },
  },
  {
    id: "vidsrc",
    name: "VidCloud-1",
    supportsDub: true,
    build: ({ anilistId, imdbId, format, season, episode, type }) => {
      const imdb = cleanImdb(imdbId || (String(anilistId).includes("tt") ? String(anilistId) : null));
      if (imdb) {
        const isMov = format === "MOVIE" || format === "movie";
        return isMov
          ? `https://vidsrc.cc/v2/embed/movie/${imdb}?autoPlay=false`
          : `https://vidsrc.cc/v2/embed/tv/${imdb}/${season || 1}/${episode}?autoPlay=false`;
      }
      return `https://vidsrc.cc/v2/embed/anime/ani${cleanAniId(anilistId)}/${episode}/${type}?autoPlay=false`;
    },
  },
  {
    id: "vidlink",
    name: "Vidstream-2",
    supportsDub: true,
    build: ({ anilistId, malId, imdbId, format, season, episode, type }) => {
      const imdb = cleanImdb(imdbId || (String(anilistId).includes("tt") ? String(anilistId) : null));
      if (imdb) {
        const isMov = format === "MOVIE" || format === "movie";
        return isMov
          ? `https://vidlink.pro/movie/${imdb}?fallback=true&primaryColor=e88b52`
          : `https://vidlink.pro/tv/${imdb}/${season || 1}/${episode}?fallback=true&primaryColor=e88b52`;
      }
      const id = getValidMalId(malId, anilistId);
      return `https://vidlink.pro/anime/${id}/${episode}/${type}?fallback=true&primaryColor=e88b52`;
    },
  },
  {
    id: "embedsu",
    name: "HD-2",
    supportsDub: false,
    build: ({ anilistId, imdbId, format, season, episode }) => {
      const imdb = cleanImdb(imdbId || (String(anilistId).includes("tt") ? String(anilistId) : null));
      if (imdb) {
        const isMov = format === "MOVIE" || format === "movie";
        return isMov
          ? `https://embed.su/embed/movie/${imdb}`
          : `https://embed.su/embed/tv/${imdb}/${season || 1}/${episode}`;
      }
      return `https://embed.su/embed/anime/ani${cleanAniId(anilistId)}/${episode}`;
    },
  },
  {
    id: "vidsrcto",
    name: "VidCloud-2",
    supportsDub: false,
    build: ({ anilistId, imdbId, format, season, episode }) => {
      const imdb = cleanImdb(imdbId || (String(anilistId).includes("tt") ? String(anilistId) : null));
      if (imdb) {
        const isMov = format === "MOVIE" || format === "movie";
        return isMov
          ? `https://vidsrc.to/embed/movie/${imdb}`
          : `https://vidsrc.to/embed/tv/${imdb}/${season || 1}/${episode}`;
      }
      return `https://vidsrc.to/embed/anime/ani${cleanAniId(anilistId)}/${episode}`;
    },
  },
  {
    id: "luciferdonghua",
    name: "LuciferDonghua",
    supportsDub: false,
    isDonghuaSpecialist: true,
    build: ({ slug, episode }) => {
      const cleanSlug = slug.replace(/-/g, " ");
      return `https://luciferdonghua.org/?s=${encodeURIComponent(cleanSlug + " episode " + episode)}`;
    },
  },
  {
    id: "dailymotion",
    name: "Dailymotion",
    supportsDub: false,
    isDonghuaSpecialist: true,
    build: ({ slug, episode }) => {
      const cleanSlug = slug.replace(/-/g, " ");
      return `https://www.dailymotion.com/search/${encodeURIComponent(cleanSlug + " episode " + episode)}`;
    },
  },
  {
    id: "keyrafara",
    name: "Keyrafara",
    supportsDub: false,
    isExternalHost: true,
    build: ({ slug }) => {
      const cleanSlug = slug.replace(/-/g, " ");
      return `https://www.keyrafara.com/streaming/donghub?query=${encodeURIComponent(cleanSlug)}`;
    },
  },
  {
    id: "donghuastream",
    name: "DonghuaStream",
    supportsDub: false,
    isExternalHost: true,
    build: ({ slug, episode }) => {
      const cleanSlug = slug.replace(/-/g, " ");
      return `https://donghuastream.org/?s=${encodeURIComponent(cleanSlug + " episode " + episode)}`;
    },
  },
  {
    id: "streamwish",
    name: "StreamWish",
    supportsDub: false,
    isExternalHost: true,
    build: ({ slug, episode }) => {
      const cleanSlug = slug.replace(/-/g, " ");
      return `https://streamwish.to/e/?search=${encodeURIComponent(cleanSlug + " " + episode)}`;
    },
  },
  {
    id: "filemoon",
    name: "Filemoon",
    supportsDub: false,
    isExternalHost: true,
    build: ({ slug, episode }) => {
      const cleanSlug = slug.replace(/-/g, " ");
      return `https://filemoon.sx/e/?search=${encodeURIComponent(cleanSlug + " " + episode)}`;
    },
  },
  {
    id: "streamtape",
    name: "Streamtape",
    supportsDub: false,
    isExternalHost: true,
    build: ({ slug, episode }) => {
      const cleanSlug = slug.replace(/-/g, " ");
      return `https://streamtape.com/search?q=${encodeURIComponent(cleanSlug + " episode " + episode)}`;
    },
  },
];

export const DEFAULT_SERVER = SERVERS[0];

export function getServer(id?: string | null): EmbedServer {
  return SERVERS.find((s) => s.id === id) ?? DEFAULT_SERVER;
}
