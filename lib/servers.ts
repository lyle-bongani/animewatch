/**
 * Embed "servers" for playback.
 *
 * We do not host any video. Each server is a third-party iframe player keyed by
 * AniList ID + episode number + audio type (sub/dub). These providers are built
 * to be embedded and typically block plain HTTP clients, but render inside a
 * browser <iframe>. They go up and down often — that's why the player exposes
 * several and lets the viewer switch, exactly like 9anime/aniwatch do.
 */

export type AudioType = "sub" | "dub";

export interface EmbedServer {
  /** Stable key used in the URL (?server=). */
  id: string;
  /** Label shown on the server button. */
  name: string;
  /** Whether this provider offers a dub track. */
  supportsDub: boolean;
  /** Build the iframe src for a given anime/episode. */
  build: (params: { anilistId: number; malId?: number | null; episode: number; type: AudioType; slug: string }) => string;
}

export const SERVERS: EmbedServer[] = [
  {
    id: "vidnest",
    name: "HD-1",
    supportsDub: true,
    build: ({ anilistId, episode, type }) =>
      `https://vidnest.fun/anime/${anilistId}/${episode}/${type}`,
  },
  {
    id: "embedsu",
    name: "HD-2",
    supportsDub: false,
    build: ({ anilistId, episode }) =>
      `https://embed.su/embed/anime/ani${anilistId}/${episode}`,
  },
  {
    id: "vidsrc",
    name: "VidCloud-1",
    supportsDub: true,
    build: ({ anilistId, episode, type }) =>
      `https://vidsrc.cc/v2/embed/anime/ani${anilistId}/${episode}/${type}?autoPlay=false`,
  },
  {
    id: "vidsrcto",
    name: "VidCloud-2",
    supportsDub: false,
    build: ({ anilistId, episode }) =>
      `https://vidsrc.to/embed/anime/ani${anilistId}/${episode}`,
  },
  {
    id: "vidlink",
    name: "Vidstream-2",
    supportsDub: true,
    build: ({ anilistId, malId, episode, type }) => {
      const id = malId || anilistId;
      return `https://vidlink.pro/anime/${id}/${episode}/${type}?fallback=true&primaryColor=e88b52`;
    },
  },
  {
    id: "vidlink-donghua",
    name: "Donghua-1",
    supportsDub: false,
    build: ({ slug, episode, type }) =>
      `https://vidlink.pro/anime/${slug}/${episode}/${type}?fallback=true&primaryColor=e88b52`,
  },
  {
    id: "vidsrcto-donghua",
    name: "Donghua-2",
    supportsDub: false,
    build: ({ slug, episode }) =>
      `https://vidsrc.to/embed/anime/${slug}/${episode}`,
  },
  {
    id: "donghuastream",
    name: "DonghuaStream",
    supportsDub: false,
    build: ({ slug }) =>
      `https://donghuastream.org/?s=${encodeURIComponent(slug.replace(/-/g, " "))}`,
  },
  {
    id: "animexin",
    name: "AnimeXin",
    supportsDub: false,
    build: ({ slug }) =>
      `https://animexin.dev/?s=${encodeURIComponent(slug.replace(/-/g, " "))}`,
  },
];

export const DEFAULT_SERVER = SERVERS[0];

export function getServer(id?: string | null): EmbedServer {
  return SERVERS.find((s) => s.id === id) ?? DEFAULT_SERVER;
}
