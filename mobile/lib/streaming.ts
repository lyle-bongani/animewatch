export interface StreamServer {
  name: string;
  url: string;
  type: "embed" | "hls" | "mp4";
  supportsDub?: boolean;
}

export interface StreamParams {
  id?: number | string;
  imdbId?: string | null;
  type?: "anime" | "movie" | "tv" | "donghua";
  season?: number;
  episode?: number;
  slug?: string;
  audioType?: "sub" | "dub";
}

export function getStreamSources({
  id,
  imdbId,
  type = "anime",
  season = 1,
  episode = 1,
  slug = "",
  audioType = "sub",
}: StreamParams): StreamServer[] {
  const cleanSlug = (slug || String(id || "")).replace(/-/g, " ");

  if (type === "movie") {
    const targetImdb = imdbId || (String(id).startsWith("tt") ? String(id) : `tt${id}`);
    return [
      {
        name: "HD-1 (VidNest)",
        url: `https://vidnest.fun/movie/${targetImdb}`,
        type: "embed",
      },
      {
        name: "VidCloud-1 (VidSrc)",
        url: `https://vidsrc.cc/v2/embed/movie/${targetImdb}?autoPlay=false`,
        type: "embed",
      },
      {
        name: "Vidstream-2 (VidLink)",
        url: `https://vidlink.pro/movie/${targetImdb}?fallback=true&primaryColor=e88b52`,
        type: "embed",
      },
      {
        name: "HD-2 (EmbedSu)",
        url: `https://embed.su/embed/movie/${targetImdb}`,
        type: "embed",
      },
      {
        name: "VidCloud-2 (VidSrcTo)",
        url: `https://vidsrc.to/embed/movie/${targetImdb}`,
        type: "embed",
      },
    ];
  }

  if (type === "tv") {
    const targetImdb = imdbId || (String(id).startsWith("tt") ? String(id) : `tt${id}`);
    return [
      {
        name: "HD-1 (VidNest)",
        url: `https://vidnest.fun/tv/${targetImdb}/${season}/${episode}`,
        type: "embed",
      },
      {
        name: "VidCloud-1 (VidSrc)",
        url: `https://vidsrc.cc/v2/embed/tv/${targetImdb}/${season}/${episode}?autoPlay=false`,
        type: "embed",
      },
      {
        name: "Vidstream-2 (VidLink)",
        url: `https://vidlink.pro/tv/${targetImdb}/${season}/${episode}?fallback=true&primaryColor=e88b52`,
        type: "embed",
      },
      {
        name: "HD-2 (EmbedSu)",
        url: `https://embed.su/embed/tv/${targetImdb}/${season}/${episode}`,
        type: "embed",
      },
      {
        name: "VidCloud-2 (VidSrcTo)",
        url: `https://vidsrc.to/embed/tv/${targetImdb}/${season}/${episode}`,
        type: "embed",
      },
    ];
  }

  if (type === "donghua") {
    return [
      {
        name: "LuciferDonghua",
        url: `https://luciferdonghua.org/?s=${encodeURIComponent(cleanSlug + " episode " + episode)}`,
        type: "embed",
      },
      {
        name: "Dailymotion",
        url: `https://www.dailymotion.com/search/${encodeURIComponent(cleanSlug + " episode " + episode)}`,
        type: "embed",
      },
      {
        name: "Keyrafara",
        url: `https://www.keyrafara.com/streaming/donghub?query=${encodeURIComponent(cleanSlug)}`,
        type: "embed",
      },
      {
        name: "DonghuaStream",
        url: `https://donghuastream.org/?s=${encodeURIComponent(cleanSlug + " episode " + episode)}`,
        type: "embed",
      },
    ];
  }

  // Default: Anime
  const anilistId = id || 1;
  return [
    {
      name: "VidCloud-1 (HD)",
      url: `https://vidsrc.cc/v2/embed/anime/ani${anilistId}/${episode}/${audioType}?autoPlay=false`,
      type: "embed",
      supportsDub: true,
    },
    {
      name: "Vidstream-2 (Multi-Sub)",
      url: `https://vidlink.pro/anime/${anilistId}/${episode}/${audioType}?fallback=true&primaryColor=e88b52`,
      type: "embed",
      supportsDub: true,
    },
    {
      name: "HD-1 (VidNest)",
      url: `https://vidnest.fun/anime/${anilistId}/${episode}/${audioType}`,
      type: "embed",
      supportsDub: true,
    },
    {
      name: "HD-2 (EmbedSu)",
      url: `https://embed.su/embed/anime/ani${anilistId}/${episode}`,
      type: "embed",
    },
    {
      name: "VidCloud-2 (VidSrcTo)",
      url: `https://vidsrc.to/embed/anime/ani${anilistId}/${episode}`,
      type: "embed",
    },
  ];
}

export function getAnimeStreamSources(id: number | string, episode = 1): StreamServer[] {
  return getStreamSources({ id, episode, type: "anime" });
}
