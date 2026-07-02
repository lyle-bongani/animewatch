"use client";

import React, { useState, useMemo } from "react";
import { displayTitle, type Anime } from "@/lib/types";

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
  icon: React.ReactNode;
  getUrl: (title: string, ep?: number) => string;
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

function getSources(title: string, malId: number): DownloadSource[] {
  const q = encodeURIComponent(title);
  return [
    {
      id: "subsplease",
      name: "SubsPlease",
      badge: "Direct MP4/MKV",
      badgeColor: "bg-green-500/15 text-green-400",
      description: "Weekly simulcast releases with 1080p, 720p and 480p options. No ads, direct file download.",
      quality: "1080p · 720p · 480p",
      icon: null,
      getUrl: (t) => `https://subsplease.org/?s=${encodeURIComponent(t)}&r=1080`,
    },
    {
      id: "nyaa",
      name: "Nyaa.si (Torrent)",
      badge: "Torrent",
      badgeColor: "bg-blue-500/15 text-blue-400",
      description: "Largest anime torrent tracker. Batch season torrents available — download an entire season in one click.",
      quality: "1080p · 4K · Batch",
      icon: null,
      getUrl: (t) => `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(t)}`,
    },
    {
      id: "animeout",
      name: "AnimeOut",
      badge: "Direct HEVC",
      badgeColor: "bg-purple-500/15 text-purple-400",
      description: "Direct Google Drive & Terabox links. Specialises in small-size HEVC/x265 encodes (great quality, tiny files).",
      quality: "x265 HEVC · Small Size",
      icon: null,
      getUrl: (t) => `https://www.animeout.xyz/?s=${encodeURIComponent(t)}`,
    },
    {
      id: "animedld",
      name: "AnimeDL (Gogoanime)",
      badge: "Direct MP4",
      badgeColor: "bg-orange-500/15 text-orange-400",
      description: "Mirror of Gogoanime's download servers. Fastest for English-dubbed content. Works on mobile too.",
      quality: "360p · 480p · 720p · 1080p",
      icon: null,
      getUrl: (t) => `https://gogoanime3.cc/search.html?keyword=${encodeURIComponent(t)}`,
    },
    {
      id: "animefest",
      name: "AnimeFest.cc",
      badge: "Direct MP4",
      badgeColor: "bg-pink-500/15 text-pink-400",
      description: "Clean interface with episode-level direct downloads, no registration required.",
      quality: "720p · 1080p",
      icon: null,
      getUrl: (t) => `https://animefest.cc/?s=${encodeURIComponent(t)}`,
    },
  ];
}

export function DownloadButton({ anime, variant = "details" }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [startEpisode, setStartEpisode] = useState(1);
  const [endEpisode, setEndEpisode] = useState(anime.episodes || 12);
  const [isCopied, setIsCopied] = useState(false);

  const totalEpisodes = useMemo(() => anime.episodes || 12, [anime.episodes]);
  const animeTitle = useMemo(() => displayTitle(anime), [anime]);
  const malId = anime.idMal || anime.id;

  const sources = useMemo(() => getSources(animeTitle, malId), [animeTitle, malId]);

  // Nyaa batch URL for entire season
  const batchNyaaUrl = `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(animeTitle)}+batch`;
  const batchSubsPlease = `https://subsplease.org/shows/${animeTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}/`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText([batchNyaaUrl, batchSubsPlease].join("\n"));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy links", err);
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
          <div className="relative w-full max-w-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-surface shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[85vh]">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Download Episodes</h3>
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
            <div className="shrink-0 flex border-b border-border bg-surface-2 p-1 gap-1">
              <button
                onClick={() => setMode("single")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${mode === "single" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                Single Episode
              </button>
              <button
                onClick={() => setMode("batch")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${mode === "batch" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                Full Season / Batch
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5 space-y-4">

              {mode === "single" ? (
                <>
                  {/* Episode selector */}
                  <div className="flex items-center gap-3">
                    <label className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted">Episode</label>
                    <select
                      value={selectedEpisode}
                      onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                      className="flex-1 rounded-xl border border-border bg-surface-2 p-2.5 text-sm font-medium outline-none focus:border-accent"
                    >
                      {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                        <option key={ep} value={ep}>Episode {ep}</option>
                      ))}
                    </select>
                  </div>

                  {/* How-to banner */}
                  <div className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      <span className="font-bold text-accent">How to download:</span> Click a source below, search for the episode, and use the site&apos;s built-in download button or magnet link. SubsPlease and AnimeOut give direct MP4 files — no torrent client needed.
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
              ) : (
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
                      <span className="font-bold text-blue-400">Best method for full seasons:</span> Use Nyaa.si &rarr; search &rarr; look for a <strong>[Batch]</strong> entry. One torrent, entire season, highest quality. Requires a torrent client (free) like <strong>qBittorrent</strong>.
                    </p>
                  </div>

                  {/* Batch sources */}
                  <div className="space-y-2.5">
                    {/* Nyaa batch */}
                    <a
                      href={batchNyaaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2 p-4 transition-all hover:border-blue-400/40 hover:bg-surface-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-foreground/95 group-hover:text-blue-400 transition-colors">Nyaa.si — Batch Season</h4>
                          <span className="rounded-full bg-blue-500/15 text-blue-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Torrent · Best Quality</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">Search for entire season batches. Single torrent download = all {totalEpisodes} episodes, usually in 1080p HEVC.</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <ExternalIcon />
                        <span className="hidden sm:inline">Batch</span>
                      </div>
                    </a>

                    {/* SubsPlease batch */}
                    <a
                      href={`https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(animeTitle)}+subsplease+batch`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2 p-4 transition-all hover:border-green-400/40 hover:bg-surface-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-foreground/95 group-hover:text-green-400 transition-colors">SubsPlease Batch (via Nyaa)</h4>
                          <span className="rounded-full bg-green-500/15 text-green-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Official Sub · 1080p</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">SubsPlease is the most trusted batch source. Simulcast quality, accurate subtitles, consistent naming.</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-bold text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all">
                        <ExternalIcon />
                        <span className="hidden sm:inline">Batch</span>
                      </div>
                    </a>

                    {/* AnimeOut */}
                    <a
                      href={`https://www.animeout.xyz/?s=${encodeURIComponent(animeTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface-2 p-4 transition-all hover:border-purple-400/40 hover:bg-surface-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-foreground/95 group-hover:text-purple-400 transition-colors">AnimeOut — HEVC Batch</h4>
                          <span className="rounded-full bg-purple-500/15 text-purple-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Direct · No Torrent</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">x265 HEVC encodes via Google Drive — no torrent client needed. Tiny file size, great quality.</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <ExternalIcon />
                        <span className="hidden sm:inline">Direct</span>
                      </div>
                    </a>
                  </div>

                  {/* Copy links */}
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-3 text-xs font-bold text-muted transition-all hover:border-accent/40 hover:text-foreground cursor-pointer"
                  >
                    {isCopied ? (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Copied!</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> Copy Batch Search Links to Clipboard</>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-surface-2 px-5 py-3 text-center">
              <p className="text-[10px] text-muted">
                Downloads are provided by independent third-party sites. Always use an ad-blocker like uBlock Origin for safety.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
