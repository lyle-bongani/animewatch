"use client";

import React, { useState, useMemo } from "react";
import { displayTitle, type Anime } from "@/lib/types";

interface DownloadButtonProps {
  anime: Anime;
  variant?: "details" | "watch";
}

export function DownloadButton({ anime, variant = "details" }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [startEpisode, setStartEpisode] = useState(1);
  const [endEpisode, setEndEpisode] = useState(anime.episodes || 12);
  const [isCopied, setIsCopied] = useState(false);

  const totalEpisodes = useMemo(() => {
    return anime.episodes || 12;
  }, [anime.episodes]);

  const animeTitle = useMemo(() => displayTitle(anime), [anime]);
  const animeId = anime.id;
  const malId = anime.idMal || anime.id;

  // Generate links for a specific episode
  const getEpisodeLinks = (ep: number) => {
    const cleanTitle = encodeURIComponent(animeTitle.replace(/[^a-zA-Z0-9\s]/g, ""));
    return [
      {
        name: "Vidlink (Fast Direct Mirror)",
        url: `https://vidlink.pro/download/anime/${malId}/${ep}`,
        note: "Provides high-speed direct downloads (Filemoon, Vidplay, Mega).",
      },
      {
        name: "Vidsrc (Multi-Host Download)",
        url: `https://vidsrc.cc/v2/embed/anime/ani${animeId}/${ep}?download=true`,
        note: "Select server tab and click download icon inside player.",
      },
      {
        name: "AnimeXin Portal Search",
        url: `https://animexin.dev/?s=${cleanTitle}`,
        note: "Search for specific subbed portal posts.",
      },
      {
        name: "DonghuaStream Portal Search",
        url: `https://donghuastream.org/?s=${cleanTitle}`,
        note: "Search for specific portal episodes.",
      },
    ];
  };

  // Generate batch URLs for clipboard copy
  const batchUrls = useMemo(() => {
    const urls: string[] = [];
    const start = Math.max(1, Math.min(startEpisode, totalEpisodes));
    const end = Math.max(start, Math.min(endEpisode, totalEpisodes));
    
    for (let i = start; i <= end; i++) {
      urls.push(`https://vidlink.pro/download/anime/${malId}/${i}`);
    }
    return urls.join("\n");
  }, [startEpisode, endEpisode, totalEpisodes, malId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(batchUrls);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy links", err);
    }
  };

  const buttonClass =
    variant === "watch"
      ? "flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/25"
      : "mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold text-foreground/90 transition-all hover:bg-surface-3 hover:border-accent/40 cursor-pointer shadow-sm";

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Download Episodes</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Download Episodes</h3>
                <p className="text-xs text-muted truncate max-w-[350px] sm:max-w-md">
                  {animeTitle}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-3 hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mode tabs */}
            <div className="flex border-b border-border bg-surface-2 p-1">
              <button
                onClick={() => setMode("single")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  mode === "single"
                    ? "bg-surface text-accent shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Single Episode
              </button>
              <button
                onClick={() => setMode("batch")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  mode === "batch"
                    ? "bg-surface text-accent shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Batch / Season Download
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {mode === "single" ? (
                <div className="space-y-5">
                  {/* Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">
                      Select Episode
                    </label>
                    <select
                      value={selectedEpisode}
                      onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-surface-2 p-3 text-sm font-medium outline-none focus:border-accent"
                    >
                      {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                        <option key={ep} value={ep}>
                          Episode {ep}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Links List */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
                      Download Options
                    </label>
                    {getEpisodeLinks(selectedEpisode).map((link, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-border/50 bg-surface-2 p-4 sm:flex-row sm:items-center hover:border-border transition-colors"
                      >
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground/90">{link.name}</h4>
                          <p className="mt-0.5 text-xs text-muted leading-relaxed">
                            {link.note}
                          </p>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-hover shrink-0 shadow-md shadow-accent/10"
                        >
                          Go to Link
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Range Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">
                        Start Episode
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={totalEpisodes}
                        value={startEpisode}
                        onChange={(e) => setStartEpisode(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface-2 p-3 text-sm font-semibold outline-none focus:border-accent"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">
                        End Episode
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={totalEpisodes}
                        value={endEpisode}
                        onChange={(e) => setEndEpisode(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface-2 p-3 text-sm font-semibold outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Batch Action */}
                  <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-center">
                    <p className="text-xs text-foreground/80 leading-relaxed max-w-sm mx-auto mb-3">
                      Generate direct download links for the entire selected range. Paste them
                      into managers like <strong>JDownloader</strong> or <strong>IDM</strong> to download in batch!
                    </p>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent-hover shadow-lg shadow-accent/20 cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4.5 w-4.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4.5 w-4.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Copy All Download Links
                        </>
                      )}
                    </button>
                  </div>

                  {/* Textarea representation */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">
                      Download List
                    </label>
                    <textarea
                      readOnly
                      value={batchUrls}
                      className="h-32 w-full resize-none rounded-xl border border-border bg-surface-2 p-3 text-xs font-mono text-muted outline-none"
                    />
                  </div>

                  {/* JDownloader Instructions */}
                  <div className="rounded-xl border border-border bg-surface-2 p-4">
                    <h5 className="text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">
                      Pro batch-downloading tip:
                    </h5>
                    <ol className="list-decimal pl-4 text-xs text-muted space-y-1">
                      <li>Download and open <strong>JDownloader 2</strong>.</li>
                      <li>Click the button above to copy the links.</li>
                      <li>JDownloader will automatically grab them via its LinkGrabber.</li>
                      <li>Right-click and hit &quot;Start All Downloads&quot;!</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-surface-2 p-4 text-center">
              <p className="text-[10px] text-muted-2">
                * Downloads are aggregated from third-party mirrors. Please verify safety checks on external sites.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
