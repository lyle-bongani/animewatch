/**
 * Anime Release Groups & Dual-Audio Parsing Utility
 * Classifies releases from SubsPlease, Erai-raws, Judas, EMBER, NDK (NanDesuKa), etc.
 */

export type ReleaseGroupType =
  | "subsplease"
  | "erai-raws"
  | "judas"
  | "ember"
  | "ndk"
  | "general";

export type AudioTypeTag =
  | "Dual-Audio (Eng+Jap)"
  | "Multi-Audio"
  | "English Dub"
  | "Simulcast Sub"
  | "Raw / Japanese";

export interface AnimeRelease {
  id: string;
  title: string;
  group: string;
  groupType: ReleaseGroupType;
  groupBadge: string;
  groupColor: string;
  audio: AudioTypeTag;
  audioColor: string;
  quality: "1080p" | "720p" | "4K" | "480p" | "Unknown";
  format: string;
  size: string;
  seeders?: number;
  leechers?: number;
  infoHash: string;
  magnetUrl: string;
  torrentUrl: string;
  pageUrl: string;
  isBatch: boolean;
}

export interface ReleaseGroupInfo {
  id: ReleaseGroupType;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  qualityText: string;
  searchUrl: (title: string) => string;
}

export const RELEASE_GROUPS: ReleaseGroupInfo[] = [
  {
    id: "subsplease",
    name: "SubsPlease",
    badge: "Simulcast · MP4/MKV",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    description: "Official weekly simulcasts in 1080p, 720p & 480p with soft subtitles. Direct files & torrents.",
    qualityText: "1080p · 720p · 480p",
    searchUrl: (t) => `https://subsplease.org/?s=${encodeURIComponent(t)}&r=1080`,
  },
  {
    id: "erai-raws",
    name: "Erai-raws",
    badge: "Multi-Audio · Dual-Audio",
    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    description: "Multi-Audio / Dual-Audio rips released immediately when dubs go live, with multi-sub tracks.",
    qualityText: "1080p · 720p · Multi-Sub",
    searchUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent("Erai-raws " + t)}`,
  },
  {
    id: "judas",
    name: "Judas",
    badge: "Dual-Audio · Small HEVC",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    description: "Popular high-efficiency x265 HEVC encodes combining Japanese + English audio in compact file sizes.",
    qualityText: "1080p · x265 HEVC · Small Size",
    searchUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent("Judas " + t)}`,
  },
  {
    id: "ember",
    name: "EMBER",
    badge: "Dual-Audio · Master HEVC",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    description: "High-bitrate HEVC WEBRip releases with English & Japanese audio tracks and uncompressed subtitles.",
    qualityText: "1080p · 4K · HEVC DDP",
    searchUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent("EMBER " + t)}`,
  },
  {
    id: "ndk",
    name: "NDK (NanDesuKa)",
    badge: "Dual-Audio MKV",
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    description: "Popular encoder group featuring Dual-Audio MKV rips (Japanese + English audio tracks).",
    qualityText: "1080p · 720p · Dual-Audio",
    searchUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent("NanDesuKa " + t)}`,
  },
];

/**
 * Identify release group from release title
 */
export function classifyReleaseGroup(title: string): {
  groupName: string;
  groupType: ReleaseGroupType;
  badge: string;
  color: string;
} {
  const lower = title.toLowerCase();

  if (lower.includes("subsplease")) {
    return {
      groupName: "SubsPlease",
      groupType: "subsplease",
      badge: "SubsPlease",
      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  }
  if (lower.includes("erai-raws") || lower.includes("erai raws")) {
    return {
      groupName: "Erai-raws",
      groupType: "erai-raws",
      badge: "Erai-raws",
      color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    };
  }
  if (lower.includes("[judas]") || lower.includes("judas")) {
    return {
      groupName: "Judas",
      groupType: "judas",
      badge: "Judas HEVC",
      color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    };
  }
  if (lower.includes("[ember]") || lower.includes("ember")) {
    return {
      groupName: "EMBER",
      groupType: "ember",
      badge: "EMBER",
      color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    };
  }
  if (lower.includes("nandesuka") || lower.includes("[ndk]") || lower.includes("ndk")) {
    return {
      groupName: "NDK (NanDesuKa)",
      groupType: "ndk",
      badge: "NDK Dual",
      color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    };
  }
  if (lower.includes("toonshub") || lower.includes("yameii")) {
    return {
      groupName: title.includes("ToonsHub") ? "ToonsHub" : "Yameii",
      groupType: "general",
      badge: "Dual-Audio",
      color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    };
  }

  // Generic extracted group name from brackets e.g. [Group]
  const match = title.match(/^\[([^\]]+)\]/);
  const grp = match ? match[1] : "Release";
  return {
    groupName: grp,
    groupType: "general",
    badge: grp,
    color: "bg-surface-3 text-foreground/80 border-border",
  };
}

/**
 * Determine Audio features (Dual-Audio, Multi-Audio, English Dub, etc.)
 */
export function classifyAudioTrack(title: string): {
  audio: AudioTypeTag;
  color: string;
} {
  const lower = title.toLowerCase();

  if (lower.includes("dual-audio") || lower.includes("dual audio") || lower.includes("dual")) {
    return {
      audio: "Dual-Audio (Eng+Jap)",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    };
  }
  if (lower.includes("multi-audio") || lower.includes("multi audio") || lower.includes("multi-varyg")) {
    return {
      audio: "Multi-Audio",
      color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    };
  }
  if (lower.includes("english dub") || lower.includes("eng dub") || lower.includes("[dub]")) {
    return {
      audio: "English Dub",
      color: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    };
  }
  if (lower.includes("raw")) {
    return {
      audio: "Raw / Japanese",
      color: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    };
  }

  return {
    audio: "Simulcast Sub",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  };
}

/**
 * Determine resolution (1080p, 720p, 4K, 480p)
 */
export function classifyQuality(title: string): "1080p" | "720p" | "4K" | "480p" | "Unknown" {
  const lower = title.toLowerCase();
  if (lower.includes("2160p") || lower.includes("4k")) return "4K";
  if (lower.includes("1080p") || lower.includes("1080")) return "1080p";
  if (lower.includes("720p") || lower.includes("720")) return "720p";
  if (lower.includes("480p") || lower.includes("480")) return "480p";
  return "Unknown";
}

/**
 * Determine video codec / format (HEVC x265, AV1, H.264)
 */
export function classifyFormat(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("x265") || lower.includes("hevc")) return "HEVC x265 (High Efficiency)";
  if (lower.includes("av1")) return "AV1 Codec";
  if (lower.includes("h.264") || lower.includes("h264") || lower.includes("x264")) return "H.264 AVC";
  return "MKV/MP4 Video";
}

/**
 * Helper to construct magnet links from infoHash and title
 */
export function buildMagnetLink(infoHash: string, title: string): string {
  const trackers = [
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://open.stealth.si:80/announce",
    "udp://tracker.torrent.eu.org:451/announce",
    "udp://tracker.bittorrent.eu.org:451/announce",
    "udp://explodie.org:6969/announce",
  ];
  const trParams = trackers.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(title)}${trParams}`;
}
