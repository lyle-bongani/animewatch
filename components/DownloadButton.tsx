"use client";

import React, { useState, useMemo, useEffect } from "react";
import { displayTitle, type Anime } from "@/lib/types";
import { getSubsPleaseSearchUrl, getSubsPleaseShowUrl, getSubsPleaseNyaaUrl } from "@/lib/subsplease";
import { RELEASE_GROUPS, type AnimeRelease, type ReleaseGroupType } from "@/lib/animeReleases";

interface DownloadButtonProps {
  anime: Anime;
  variant?: "details" | "watch";
}

interface DownloadSource {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  quality: string;
  getUrl: (title: string) => string;
}

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ExternalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const MagnetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

function getSources(title: string, isChinese = false): DownloadSource[] {
  const baseSources: DownloadSource[] = [
    {
      id: "subsplease",
      name: "SubsPlease",
      badge: "Official Simulcast",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      description: "Weekly simulcast release leader with 1080p, 720p & 480p options. Direct files, torrents & magnets.",
      quality: "1080p · 720p · 480p · Direct MP4/MKV",
      getUrl: (t) => getSubsPleaseSearchUrl(t),
    },
    {
      id: "erai-raws",
      name: "Erai-raws",
      badge: "Multi-Audio / Multi-Sub",
      badgeColor: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
      description: "Provides multi-audio and dual-audio rips immediately when dubs go live, plus multi-subtitle options.",
      quality: "1080p · 720p · Multi-Audio",
      getUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent("Erai-raws " + t)}`,
    },
    {
      id: "judas",
      name: "Judas",
      badge: "Dual-Audio · Small HEVC",
      badgeColor: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
      description: "Popular encoder group specializing in high-efficiency x265/HEVC Dual-Audio (Japanese + English) rips.",
      quality: "x265 HEVC · Dual-Audio · Small Size",
      getUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent("Judas " + t)}`,
    },
    {
      id: "ember",
      name: "EMBER",
      badge: "Dual-Audio · Master HEVC",
      badgeColor: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      description: "High-bitrate Dual-Audio master releases (1080p & 4K HEVC) with uncompressed Japanese & English audio.",
      quality: "1080p · 4K · HEVC DDP",
      getUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent("EMBER " + t)}`,
    },
    {
      id: "ndk",
      name: "NDK (NanDesuKa)",
      badge: "Dual-Audio MKV",
      badgeColor: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      description: "High-efficiency Dual-Audio release group providing Japanese + English audio tracks in single MKV files.",
      quality: "1080p · 720p · Dual-Audio",
      getUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent("NanDesuKa " + t)}`,
    },
    {
      id: "animeout",
      name: "AnimeOut",
      badge: "Direct HEVC (GDrive)",
      badgeColor: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
      description: "Direct Google Drive & Terabox links. Specialized in small-size HEVC/x265 encodes — no torrent client needed.",
      quality: "x265 HEVC · Direct GDrive",
      getUrl: (t) => `https://www.animeout.xyz/?s=${encodeURIComponent(t)}`,
    },
    {
      id: "nyaa",
      name: "Nyaa.si (All Torrents)",
      badge: "Torrent Tracker",
      badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
      description: "Largest anime torrent tracker. Search all release groups, batches, dual-audio, and BD remuxes.",
      quality: "1080p · 4K · Batches",
      getUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(t)}`,
    },
    {
      id: "luciferdonghua",
      name: "Lucifer Donghua",
      badge: "Chinese Donghua",
      badgeColor: "bg-red-500/15 text-red-400 border border-red-500/30",
      description: "Dedicated Chinese Animation (Donghua) stream & download portal with raw/subbed episodes.",
      quality: "1080p · 720p · Donghua",
      getUrl: (t) => `https://luciferdonghua.org/?s=${encodeURIComponent(t)}`,
    },
  ];

  if (isChinese) {
    const lucIdx = baseSources.findIndex((s) => s.id === "luciferdonghua");
    if (lucIdx > 0) {
      const luc = baseSources.splice(lucIdx, 1)[0];
      baseSources.unshift(luc);
    }
  }

  return baseSources;
}

export function DownloadButton({ anime, variant = "details" }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "live" | "batch">("single");
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [startEpisode, setStartEpisode] = useState(1);
  const [endEpisode, setEndEpisode] = useState(anime.episodes || 12);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedReleaseId, setCopiedReleaseId] = useState<string | null>(null);

  // Live releases state
  const [groupFilter, setGroupFilter] = useState<ReleaseGroupType | "all">("all");
  const [liveReleases, setLiveReleases] = useState<AnimeRelease[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const totalEpisodes = useMemo(() => anime.episodes || 12, [anime.episodes]);
  const animeTitle = useMemo(() => displayTitle(anime), [anime]);
  const isChinese = anime.countryOfOrigin === "CN";

  const sources = useMemo(() => getSources(animeTitle, isChinese), [animeTitle, isChinese]);

  // Nyaa batch URL for entire season
  const batchNyaaUrl = `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(animeTitle)}+batch`;
  const batchSubsPlease = getSubsPleaseNyaaUrl(animeTitle, true);

  // Fetch live releases when live mode tab is active or parameters change
  useEffect(() => {
    if (mode !== "live" || !isOpen) return;

    let isMounted = true;
    setLiveLoading(true);
    setLiveError(null);

    const groupQuery = groupFilter !== "all" ? `&group=${groupFilter}` : "";
    const epQuery = `&episode=${selectedEpisode}`;

    fetch(`/api/releases?title=${encodeURIComponent(animeTitle)}${epQuery}${groupQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.releases) {
          setLiveReleases(data.releases);
        } else {
          setLiveReleases([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Live release fetch error:", err);
        setLiveError("Unable to fetch live release feed right now. You can use the provider links below.");
      })
      .finally(() => {
        if (isMounted) setLiveLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mode, isOpen, animeTitle, selectedEpisode, groupFilter]);

  const handleCopyBatch = async () => {
    try {
      await navigator.clipboard.writeText([batchNyaaUrl, batchSubsPlease].join("\n"));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy links", err);
    }
  };

  const handleCopyMagnet = async (release: AnimeRelease) => {
    try {
      await navigator.clipboard.writeText(release.magnetUrl);
      setCopiedReleaseId(release.id);
      setTimeout(() => setCopiedReleaseId(null), 2000);
    } catch (err) {
      console.error("Failed to copy magnet link", err);
    }
  };

  const buttonClass =
    variant === "watch"
      ? "flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/25 cursor-pointer"
      : "mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold text-foreground/90 transition-all hover:bg-surface-3 hover:border-accent/40 cursor-pointer shadow-sm";

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClass}>
        <DownloadIcon />
        <span>Download Episodes</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-surface shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[88vh]">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border p-4 sm:p-5">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Download & Release Sources</span>
                  <span className="rounded-full bg-accent/15 text-accent text-[10px] font-bold px-2 py-0.5 border border-accent/30">
                    Dual-Audio & Simulcast
                  </span>
                </h3>
                <p className="text-xs text-muted truncate max-w-[280px] sm:max-w-md">{animeTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-3 hover:text-foreground transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mode tabs */}
            <div className="shrink-0 flex border-b border-border bg-surface-2 p-1 gap-1 overflow-x-auto">
              <button
                onClick={() => setMode("single")}
                className={`flex-1 min-w-[120px] rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${mode === "single" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                Providers & Direct Links
              </button>
              <button
                onClick={() => setMode("live")}
                className={`flex-1 min-w-[150px] rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${mode === "live" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                <MagnetIcon />
                <span>Live Magnets & Dual-Audio</span>
              </button>
              <button
                onClick={() => setMode("batch")}
                className={`flex-1 min-w-[120px] rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${mode === "batch" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                Full Season / Batch
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-4">

              {mode === "single" && (
                <>
                  {/* Quick Group Highlight Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {RELEASE_GROUPS.map((grp) => (
                      <a
                        key={grp.id}
                        href={grp.searchUrl(animeTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl border text-center transition-all hover:scale-[1.02] cursor-pointer ${grp.badgeColor}`}
                      >
                        <div className="text-xs font-bold truncate">{grp.name}</div>
                        <div className="text-[10px] opacity-85 truncate mt-0.5">{grp.qualityText.split("·")[0]}</div>
                      </a>
                    ))}
                  </div>

                  {/* How-to banner */}
                  <div className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      <span className="font-bold text-accent">Simulcast & Dual-Audio Downloads:</span> Click a provider below to search for episode downloads. <strong className="text-foreground">SubsPlease</strong> & <strong className="text-foreground">AnimeOut</strong> offer direct downloads, while <strong className="text-foreground">Erai-raws</strong>, <strong className="text-foreground">Judas</strong>, <strong className="text-foreground">EMBER</strong>, and <strong className="text-foreground">NDK</strong> provide multi-audio / dual-audio rips.
                    </p>
                  </div>

                  {/* Sources grid */}
                  <div className="space-y-2.5">
                    {sources.map((src) => (
                      <a
                        key={src.id}
                        href={src.getUrl(animeTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2 p-4 transition-all hover:border-accent/40 hover:bg-surface-3 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-foreground/95 group-hover:text-accent transition-colors">{src.name}</h4>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${src.badgeColor}`}>
                              {src.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted leading-relaxed">{src.description}</p>
                          <p className="mt-1 text-[10px] font-semibold text-muted-2 uppercase tracking-wide">{src.quality}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-2 text-xs font-bold text-accent group-hover:bg-accent group-hover:text-white transition-all">
                          <ExternalIcon />
                          <span className="hidden sm:inline">Open</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}

              {mode === "live" && (
                <>
                  {/* Episode Selector & Group Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Episode:</label>
                      <select
                        value={selectedEpisode}
                        onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                        className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
                      >
                        {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                          <option key={ep} value={ep}>Episode {ep}</option>
                        ))}
                      </select>
                    </div>

                    {/* Group filter pills */}
                    <div className="flex flex-wrap gap-1.5 overflow-x-auto">
                      <button
                        onClick={() => setGroupFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${groupFilter === "all" ? "bg-accent text-white" : "bg-surface-2 text-muted hover:bg-surface-3"}`}
                      >
                        All Groups
                      </button>
                      <button
                        onClick={() => setGroupFilter("subsplease")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${groupFilter === "subsplease" ? "bg-emerald-500 text-white" : "bg-surface-2 text-emerald-400/80 hover:bg-surface-3"}`}
                      >
                        SubsPlease
                      </button>
                      <button
                        onClick={() => setGroupFilter("erai-raws")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${groupFilter === "erai-raws" ? "bg-cyan-500 text-white" : "bg-surface-2 text-cyan-400/80 hover:bg-surface-3"}`}
                      >
                        Erai-raws
                      </button>
                      <button
                        onClick={() => setGroupFilter("judas")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${groupFilter === "judas" ? "bg-purple-500 text-white" : "bg-surface-2 text-purple-400/80 hover:bg-surface-3"}`}
                      >
                        Judas HEVC
                      </button>
                      <button
                        onClick={() => setGroupFilter("ember")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${groupFilter === "ember" ? "bg-amber-500 text-white" : "bg-surface-2 text-amber-400/80 hover:bg-surface-3"}`}
                      >
                        EMBER
                      </button>
                      <button
                        onClick={() => setGroupFilter("ndk")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${groupFilter === "ndk" ? "bg-rose-500 text-white" : "bg-surface-2 text-rose-400/80 hover:bg-surface-3"}`}
                      >
                        NDK Dual
                      </button>
                    </div>
                  </div>

                  {/* Live releases feed */}
                  {liveLoading ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
                      <p className="text-xs text-muted">Searching live release feeds for SubsPlease, Erai-raws, Judas, EMBER & NDK...</p>
                    </div>
                  ) : liveError ? (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-center">
                      <p className="text-xs text-red-400 font-semibold">{liveError}</p>
                    </div>
                  ) : liveReleases.length === 0 ? (
                    <div className="rounded-xl border border-border bg-surface-2 p-8 text-center space-y-3">
                      <p className="text-sm font-semibold text-foreground">No active live magnet releases matched this filter for Episode {selectedEpisode}.</p>
                      <p className="text-xs text-muted">Try switching the group filter to &quot;All Groups&quot; or use the Direct Providers tab above.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {liveReleases.map((release) => (
                        <div
                          key={release.id}
                          className="rounded-xl border border-border/70 bg-surface-2 p-4 transition-all hover:border-accent/40 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${release.groupColor}`}>
                                  {release.groupBadge}
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${release.audioColor}`}>
                                  {release.audio}
                                </span>
                                {release.quality !== "Unknown" && (
                                  <span className="rounded-full bg-surface-3 text-foreground/90 px-2 py-0.5 text-[10px] font-bold border border-border">
                                    {release.quality}
                                  </span>
                                )}
                                {release.isBatch && (
                                  <span className="rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[10px] font-bold border border-blue-500/40">
                                    BATCH
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-semibold text-foreground leading-snug break-words">
                                {release.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted border-t border-border/40 pt-2.5">
                            <div className="flex items-center gap-3">
                              <span>Size: <strong className="text-foreground/90">{release.size}</strong></span>
                              <span>Format: <strong className="text-foreground/90">{release.format}</strong></span>
                              {release.seeders !== undefined && (
                                <span className="text-emerald-400 font-semibold">{release.seeders} seeds</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Copy Magnet */}
                              <button
                                onClick={() => handleCopyMagnet(release)}
                                className="flex items-center gap-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 px-3 py-1.5 text-xs font-bold text-foreground transition-all cursor-pointer"
                              >
                                {copiedReleaseId === release.id ? (
                                  <span className="text-emerald-400">✓ Copied!</span>
                                ) : (
                                  <>
                                    <MagnetIcon />
                                    <span>Copy Magnet</span>
                                  </>
                                )}
                              </button>

                              {/* Open Magnet */}
                              <a
                                href={release.magnetUrl}
                                className="flex items-center gap-1 rounded-lg bg-accent/15 hover:bg-accent hover:text-white px-3 py-1.5 text-xs font-bold text-accent transition-all"
                              >
                                <span>Open Magnet</span>
                              </a>

                              {/* Torrent File */}
                              <a
                                href={release.torrentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-3 transition-colors"
                                title="Download .torrent"
                              >
                                <ExternalIcon />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {mode === "batch" && (
                <>
                  {/* Range selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">From Episode</label>
                      <input
                        type="number" min={1} max={totalEpisodes} value={startEpisode}
                        onChange={(e) => setStartEpisode(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface-2 p-2.5 text-sm font-semibold outline-none focus:border-accent"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">To Episode</label>
                      <input
                        type="number" min={1} max={totalEpisodes} value={endEpisode}
                        onChange={(e) => setEndEpisode(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface-2 p-2.5 text-sm font-semibold outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Batch tip banner */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      <span className="font-bold text-blue-400">Best method for full seasons:</span> Search for a <strong>[Batch]</strong> torrent on <strong className="text-foreground">SubsPlease</strong>, <strong className="text-foreground">Erai-raws</strong>, or <strong className="text-foreground">Judas</strong>. One torrent download = all {totalEpisodes} episodes, with full dual-audio or multi-subs.
                    </p>
                  </div>

                  {/* Batch sources */}
                  <div className="space-y-2.5">
                    {/* SubsPlease batch */}
                    <a
                      href={batchSubsPlease}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2 p-4 transition-all hover:border-emerald-400/40 hover:bg-surface-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-foreground/95 group-hover:text-emerald-400 transition-colors">SubsPlease Batch (1080p)</h4>
                          <span className="rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Official Sub · Simulcast</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">SubsPlease official batch releases. Complete season torrents with consistent 1080p quality & soft subtitles.</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <ExternalIcon />
                        <span className="hidden sm:inline">Batch</span>
                      </div>
                    </a>

                    {/* Erai-raws / Judas Dual-Audio batch */}
                    <a
                      href={`https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(animeTitle)}+dual-audio+batch`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2 p-4 transition-all hover:border-purple-400/40 hover:bg-surface-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-foreground/95 group-hover:text-purple-400 transition-colors">Dual-Audio Batch (Judas / EMBER / NDK)</h4>
                          <span className="rounded-full bg-purple-500/15 text-purple-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Dual-Audio · x265 HEVC</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">Full season batch encodes featuring both Japanese & English audio tracks in lightweight x265 HEVC files.</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <ExternalIcon />
                        <span className="hidden sm:inline">Batch</span>
                      </div>
                    </a>

                    {/* Nyaa batch */}
                    <a
                      href={batchNyaaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2 p-4 transition-all hover:border-blue-400/40 hover:bg-surface-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-foreground/95 group-hover:text-blue-400 transition-colors">Nyaa.si — All Season Batches</h4>
                          <span className="rounded-full bg-blue-500/15 text-blue-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">All Groups · Torrent</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">Browse all full season batch releases across all release groups on Nyaa.</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <ExternalIcon />
                        <span className="hidden sm:inline">Browse</span>
                      </div>
                    </a>
                  </div>

                  {/* Copy links */}
                  <button
                    onClick={handleCopyBatch}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-3 text-xs font-bold text-muted transition-all hover:border-accent/40 hover:text-foreground cursor-pointer"
                  >
                    {isCopied ? (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Copied!</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> Copy Batch Search Links to Clipboard</>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-surface-2 px-5 py-3 text-center">
              <p className="text-[10px] text-muted">
                Downloads and magnet links are provided for convenience. Always use trusted clients and safety extensions like uBlock Origin.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
