"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SERVERS, getServer, type AudioType } from "@/lib/servers";
import type { Anime, StreamingEpisode } from "@/lib/types";
import { displayTitle, stripHtml, formatLabel, groupRelations } from "@/lib/types";
import {
  type DailymotionVideo,
  getDailymotionEmbedUrl,
  formatDuration,
  formatViews,
} from "@/lib/dailymotion";
import { AnimeRow } from "./AnimeRow";
import { DownloadButton } from "./DownloadButton";

interface HistoryEntry {
  id: number;
  title: string;
  coverImage: string;
  episode: number;
  totalEpisodes: number;
  timestamp: number;
}

export function WatchClient({
  anime,
  totalEpisodes,
  initialEpisode,
  streamingEpisodes,
}: {
  anime: Anime;
  totalEpisodes: number;
  initialEpisode: number;
  streamingEpisodes: StreamingEpisode[];
}) {
  const isChinese = anime.countryOfOrigin === "CN";
  const [episode, setEpisode] = useState(initialEpisode);
  const [serverId, setServerId] = useState(() => {
    if (isChinese) return "luciferdonghua";
    return SERVERS.find((s) => s.id === "vidnest")?.id ?? SERVERS[0].id;
  });
  const [type, setType] = useState<AudioType>("sub");
  const [search, setSearch] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [lightOff, setLightOff] = useState(false);

  // Dynamic Lucifer resolved servers
  const [luciferServers, setLuciferServers] = useState<{ label: string; embedUrl: string }[]>([]);
  const [selectedLuciferIdx, setSelectedLuciferIdx] = useState(0);
  const [luciferLoading, setLuciferLoading] = useState(false);

  // Dynamic Dailymotion resolved video streams
  const [dailymotionVideos, setDailymotionVideos] = useState<DailymotionVideo[]>([]);
  const [selectedDailymotionIdx, setSelectedDailymotionIdx] = useState(0);
  const [dailymotionLoading, setDailymotionLoading] = useState(false);
  const [dmSearchInput, setDmSearchInput] = useState("");

  const server = getServer(serverId);
  const animeTitle = displayTitle(anime);
  const slug = (anime.title.english || anime.title.romaji || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const defaultSrc = server.build({ anilistId: anime.id, malId: anime.idMal, episode, type, slug });

  function searchCustomDailymotion(queryToSearch?: string) {
    const term = (queryToSearch !== undefined ? queryToSearch : dmSearchInput).trim();
    if (!term) return;
    setDailymotionLoading(true);
    fetch(`/api/dailymotion?custom=${encodeURIComponent(term)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.videos && data.videos.length > 0) {
          setDailymotionVideos(data.videos);
          setSelectedDailymotionIdx(0);
        } else {
          setDailymotionVideos([]);
        }
      })
      .catch((e) => console.error("Custom Dailymotion search error:", e))
      .finally(() => {
        setDailymotionLoading(false);
      });
  }

  // Dynamically resolve Lucifer Donghua iframes when Lucifer server is selected
  useEffect(() => {
    if (serverId !== "luciferdonghua") return;
    let isSubbed = true;
    setLuciferLoading(true);
    fetch(`/api/search?mode=lucifer&q=${encodeURIComponent(animeTitle)}&ep=${episode}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isSubbed) return;
        if (data.servers && data.servers.length > 0) {
          setLuciferServers(data.servers);
          setSelectedLuciferIdx(0);
        } else {
          setLuciferServers([]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (isSubbed) setLuciferLoading(false);
      });

    return () => {
      isSubbed = false;
    };
  }, [serverId, animeTitle, episode]);

  // Dynamically resolve Dailymotion API video streams when Dailymotion server is selected
  useEffect(() => {
    if (serverId !== "dailymotion") return;
    let isSubbed = true;
    setDailymotionLoading(true);
    setDmSearchInput(`${animeTitle} episode ${episode}`);
    const nativeTitle = anime.title.native || "";
    fetch(
      `/api/dailymotion?q=${encodeURIComponent(animeTitle)}&ep=${episode}&native=${encodeURIComponent(nativeTitle)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isSubbed) return;
        if (data.videos && data.videos.length > 0) {
          setDailymotionVideos(data.videos);
          setSelectedDailymotionIdx(0);
        } else {
          setDailymotionVideos([]);
        }
      })
      .catch((e) => console.error("Dailymotion fetch error:", e))
      .finally(() => {
        if (isSubbed) setDailymotionLoading(false);
      });

    return () => {
      isSubbed = false;
    };
  }, [serverId, animeTitle, anime.title.native, episode]);

  const dailymotionSrc = dailymotionVideos[selectedDailymotionIdx]
    ? getDailymotionEmbedUrl(dailymotionVideos[selectedDailymotionIdx].id)
    : defaultSrc;

  const activeSrc =
    serverId === "luciferdonghua" && luciferServers.length > 0
      ? luciferServers[selectedLuciferIdx]?.embedUrl || defaultSrc
      : serverId === "dailymotion" && dailymotionVideos.length > 0
      ? dailymotionSrc
      : defaultSrc;

  // Keep the URL shareable without a full navigation.
  useEffect(() => {
    window.history.replaceState(null, "", `/watch/${anime.id}?ep=${episode}`);
  }, [anime.id, episode]);

  // Track playback history
  useEffect(() => {
    try {
      const stored = localStorage.getItem("animewatch_history");
      const list: HistoryEntry[] = stored ? (JSON.parse(stored) as HistoryEntry[]) : [];
      const filtered = list.filter((item) => item.id !== anime.id);

      const newItem = {
        id: anime.id,
        title: displayTitle(anime),
        coverImage: anime.coverImage.extraLarge ?? anime.coverImage.large ?? "",
        episode,
        totalEpisodes,
        timestamp: Date.now(),
      };

      filtered.unshift(newItem);
      localStorage.setItem("animewatch_history", JSON.stringify(filtered));

      // Dispatch event to notify homepage/other components
      window.dispatchEvent(new Event("history-update"));
    } catch (e) {
      console.error(e);
    }
  }, [anime, episode, totalEpisodes]);

  const episodes = useMemo(
    () => Array.from({ length: totalEpisodes }, (_, i) => i + 1),
    [totalEpisodes],
  );
  const filtered = useMemo(() => {
    if (!search.trim()) return episodes;
    return episodes.filter((n) => String(n).includes(search.trim()));
  }, [episodes, search]);

  const recs = useMemo(() => {
    return (
      anime.recommendations?.nodes
        .map((n) => n.mediaRecommendation)
        .filter((m): m is Anime => !!m) ?? []
    );
  }, [anime.recommendations]);

  const studios = anime.studios?.nodes.map((s) => s.name).filter(Boolean) ?? [];

  const groupedRelations = useMemo(() => {
    return groupRelations(anime);
  }, [anime]);

  function changeEpisode(n: number) {
    setEpisode(n);
    setIframeKey((k) => k + 1);
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6">
      {/* Lights Off Overlay */}
      {lightOff && (
        <div
          onClick={() => setLightOff(false)}
          className="fixed inset-0 z-40 bg-black/95 transition-opacity duration-300"
          title="Click to turn lights back on"
        />
      )}

      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/anime/${anime.id}`} className="hover:text-foreground">
          {displayTitle(anime)}
        </Link>{" "}
        / <span className="text-foreground">Episode {episode}</span>
      </nav>
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3.5 text-xs sm:text-sm text-foreground/90 shadow-sm animate-fade-in">
        <span className="text-lg shrink-0">🛡️</span>
        <div className="leading-snug">
          <span className="font-semibold text-accent">Ad-Free Streaming:</span> Since streams are served by third parties, we highly recommend using <a href="https://brave.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-accent-hover transition-colors">Brave Browser</a> or the <a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-accent-hover transition-colors">uBlock Origin</a> extension to automatically block all player popups and redirects.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Player column */}
        <div className={lightOff ? "relative z-50" : ""}>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-2xl">
            {serverId === "luciferdonghua" ? (
              luciferLoading ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-surface">
                  <span className="h-10 w-10 animate-spin rounded-full border-3 border-accent border-t-transparent" />
                  <p className="text-sm font-semibold text-muted">Resolving Lucifer Donghua iframe players...</p>
                </div>
              ) : luciferServers.length > 0 ? (
                <iframe
                  key={`${iframeKey}-${selectedLuciferIdx}`}
                  src={activeSrc}
                  title={`${displayTitle(anime)} — Episode ${episode}`}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  referrerPolicy="origin"
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-surface-2 via-surface to-background">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-foreground sm:text-xl">
                    LuciferDonghua Direct Link
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs text-muted leading-relaxed sm:text-sm">
                    <span className="font-semibold text-foreground">{displayTitle(anime)}</span> · Episode {episode} page is ready. Open stream below:
                  </p>
                  <a
                    href={defaultSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-105 hover:bg-accent-hover cursor-pointer"
                  >
                    Launch LuciferDonghua Stream ↗
                  </a>
                </div>
              )
            ) : serverId === "dailymotion" ? (
              dailymotionLoading ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-surface">
                  <span className="h-10 w-10 animate-spin rounded-full border-3 border-accent border-t-transparent" />
                  <p className="text-sm font-semibold text-muted">Searching Dailymotion for Episode {episode} streams...</p>
                </div>
              ) : dailymotionVideos.length > 0 ? (
                <div className="relative h-full w-full">
                  <iframe
                    key={`dm-${iframeKey}-${selectedDailymotionIdx}`}
                    src={dailymotionSrc}
                    title={`${displayTitle(anime)} — Episode ${episode} (Dailymotion)`}
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share"
                    referrerPolicy="origin"
                    className="h-full w-full border-0"
                  />
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-surface-2 via-surface to-background">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-foreground sm:text-xl">
                    No Direct Matches Found
                  </h3>
                  <p className="mt-1 max-w-md text-xs text-muted leading-relaxed sm:text-sm">
                    Search Dailymotion with a custom keyword or sub group:
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      searchCustomDailymotion();
                    }}
                    className="mt-4 flex w-full max-w-sm items-center gap-2"
                  >
                    <input
                      type="text"
                      value={dmSearchInput}
                      onChange={(e) => setDmSearchInput(e.target.value)}
                      placeholder={`e.g. ${animeTitle} ${episode}`}
                      className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-hover cursor-pointer"
                    >
                      Search
                    </button>
                  </form>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={defaultSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent underline hover:text-accent-hover"
                    >
                      Open Dailymotion in new tab ↗
                    </a>
                  </div>
                </div>
              )
            ) : server.isExternalHost ? (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-surface-2 via-surface to-background">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-inner">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-foreground sm:text-xl">
                  {server.name} Stream Host
                </h3>
                <p className="mt-1.5 max-w-md text-xs text-muted leading-relaxed sm:text-sm">
                  <span className="font-semibold text-foreground">{displayTitle(anime)}</span> · Episode {episode} is hosted on {server.name}. Click below to launch:
                </p>
                <a
                  href={defaultSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-105 hover:bg-accent-hover cursor-pointer"
                >
                  Launch {server.name} Stream ↗
                </a>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                src={defaultSrc}
                title={`${displayTitle(anime)} — Episode ${episode}`}
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="origin"
                className="h-full w-full"
              />
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-bold">
              {displayTitle(anime)}{" "}
              <span className="text-muted">· Episode {episode}</span>
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setLightOff(!lightOff)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  lightOff
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface hover:bg-surface-2 text-foreground"
                }`}
              >
                {lightOff ? "💡 Lights On" : "🕶️ Lights Off"}
              </button>
              <button
                onClick={() => changeEpisode(Math.max(1, episode - 1))}
                disabled={episode <= 1}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-2 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => changeEpisode(Math.min(totalEpisodes, episode + 1))}
                disabled={episode >= totalEpisodes}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-2 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Audio + servers */}
          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Audio
                </span>
                {(["sub", "dub"] as AudioType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setType(t);
                      setIframeKey((k) => k + 1);
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      type === t
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-muted hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Server
                </span>
                {SERVERS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setServerId(s.id);
                      setIframeKey((k) => k + 1);
                    }}
                    className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      s.id === serverId
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-muted hover:text-foreground"
                    }`}
                  >
                    <span>{s.name}</span>
                    {s.isDonghuaSpecialist && (
                      <span className={`rounded px-1 py-0.5 text-[9px] font-extrabold uppercase ${
                        s.id === serverId ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        CN
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolved Lucifer Donghua mirrors bar */}
            {serverId === "luciferdonghua" && luciferServers.length > 0 && (
              <div className="mt-3.5 border-t border-border/50 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    Lucifer Stream Mirrors:
                  </span>
                  {luciferServers.map((srv, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedLuciferIdx(idx)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                        selectedLuciferIdx === idx
                          ? "bg-white text-black shadow-sm"
                          : "bg-surface-2 text-muted hover:text-foreground"
                      }`}
                    >
                      {srv.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Dailymotion Uploads bar */}
            {serverId === "dailymotion" && (
              <div className="mt-3.5 border-t border-border/50 pt-3">
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                      <span>🎬</span> Dailymotion Streams {dailymotionVideos.length > 0 ? `(${dailymotionVideos.length})` : ""}:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted hidden sm:inline">
                        If a stream is deleted/blocked, pick another below or search
                      </span>
                      {dailymotionVideos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDailymotionIdx((idx) => (idx + 1) % dailymotionVideos.length)}
                          className="rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-accent hover:bg-surface-3 hover:text-white transition-colors cursor-pointer"
                        >
                          Next Mirror ↻
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search query input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      searchCustomDailymotion();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={dmSearchInput}
                      onChange={(e) => setDmSearchInput(e.target.value)}
                      placeholder={`Search custom title (e.g. ${animeTitle} episode ${episode})...`}
                      className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={dailymotionLoading}
                      className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50 cursor-pointer"
                    >
                      {dailymotionLoading ? "Searching..." : "Search"}
                    </button>
                  </form>

                  {dailymotionVideos.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {dailymotionVideos.map((vid, idx) => (
                        <button
                          key={vid.id}
                          onClick={() => setSelectedDailymotionIdx(idx)}
                          className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all cursor-pointer ${
                            selectedDailymotionIdx === idx
                              ? "border-accent bg-accent/10 ring-1 ring-accent"
                              : "border-border/60 bg-surface-2 hover:border-border hover:bg-surface-3"
                          }`}
                        >
                          {vid.thumbnail_240_url && (
                            <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-black">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={vid.thumbnail_240_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                              {vid.duration ? (
                                <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[9px] font-bold text-white">
                                  {formatDuration(vid.duration)}
                                </span>
                              ) : null}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-1 text-xs font-semibold text-foreground">
                              {vid.title}
                            </h4>
                            <p className="mt-0.5 text-[10px] text-muted">
                              {vid.owner?.screenname || "Dailymotion"} · {formatViews(vid.views_total)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="mt-3 text-xs text-muted">
              If a video doesn&apos;t load or shows an error, switch to another
              server or audio track above. Playback is provided by third parties.
            </p>
          </div>

          {/* Anime Info Panel */}
          <div className="mt-6 flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={anime.coverImage.large ?? anime.coverImage.extraLarge ?? ""}
              alt={displayTitle(anime)}
              className="h-44 w-32 shrink-0 rounded-lg object-cover ring-1 ring-border shadow"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold">{displayTitle(anime)}</h2>
                <DownloadButton anime={anime} variant="watch" />
              </div>

              {anime.title.native && (
                <p className="text-xs text-muted mt-0.5">{anime.title.native}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                {anime.averageScore && (
                  <span className="font-semibold text-yellow-400">
                    ★ {(anime.averageScore / 10).toFixed(1)}
                  </span>
                )}
                <span>{formatLabel(anime.format)}</span>
                <span>{anime.episodes ?? totalEpisodes} episodes</span>
                {anime.seasonYear && <span>{anime.seasonYear}</span>}
                {studios.length > 0 && <span>Studios: {studios.slice(0, 2).join(", ")}</span>}
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-foreground/80">
                {stripHtml(anime.description) || "No synopsis available."}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {anime.genres.slice(0, 5).map((g) => (
                  <span
                    key={g}
                    className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Seasons & Series */}
        {groupedRelations.seasons.length > 1 && (
          <aside className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Seasons
            </h2>
            <div className="flex flex-col gap-2.5">
              {groupedRelations.seasons.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/watch/${rel.id}?ep=1`}
                  className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:border-accent/40 hover:bg-surface-3 cursor-pointer ${
                    rel.isCurrent 
                      ? "border-accent bg-accent/5 ring-1 ring-accent" 
                      : "border-border/50 bg-surface-2"
                  }`}
                >
                  {rel.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rel.cover}
                      alt=""
                      loading="lazy"
                      className="h-12 w-9 rounded object-cover shadow-sm shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent leading-none">
                      Season {rel.seasonNumber} {rel.year ? `(${rel.year})` : ""}
                    </span>
                    <h3 className="mt-1 truncate text-xs font-semibold text-foreground/90">
                      {rel.title}
                    </h3>
                    <p className="text-[10px] text-muted capitalize mt-0.5">
                      {rel.format} · {rel.status?.toLowerCase()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {groupedRelations.moviesAndSpecials.length > 0 && (
          <aside className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Movies & Specials
            </h2>
            <div className="flex flex-col gap-2.5">
              {groupedRelations.moviesAndSpecials.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/watch/${rel.id}?ep=1`}
                  className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:border-accent/40 hover:bg-surface-3 cursor-pointer ${
                    rel.isCurrent 
                      ? "border-accent bg-accent/5 ring-1 ring-accent" 
                      : "border-border/50 bg-surface-2"
                  }`}
                >
                  {rel.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rel.cover}
                      alt=""
                      loading="lazy"
                      className="h-12 w-9 rounded object-cover shadow-sm shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent leading-none">
                      {rel.relationType.replace(/_/g, " ")} {rel.year ? `(${rel.year})` : ""}
                    </span>
                    <h3 className="mt-1 truncate text-xs font-semibold text-foreground/90">
                      {rel.title}
                    </h3>
                    <p className="text-[10px] text-muted capitalize mt-0.5">
                      {rel.format} · {rel.status?.toLowerCase()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Episode list */}
        <aside className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border p-3">
            <h2 className="mb-2 text-sm font-semibold">
              Episodes <span className="text-muted">({totalEpisodes})</span>
            </h2>
            {totalEpisodes > 24 && (
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Jump to episode #"
                inputMode="numeric"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none placeholder:text-muted focus:border-accent"
              />
            )}
          </div>
          <ul className="max-h-[70vh] overflow-y-auto p-2">
            {filtered.map((n) => {
              const info = streamingEpisodes[n - 1];
              const active = n === episode;
              return (
                <li key={n}>
                  <button
                    onClick={() => changeEpisode(n)}
                    className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                      active ? "bg-accent/15 ring-1 ring-accent" : "hover:bg-surface-2"
                    }`}
                  >
                    {info?.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={info.thumbnail}
                        alt=""
                        loading="lazy"
                        className="h-12 w-20 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <span
                        className={`grid h-12 w-20 shrink-0 place-items-center rounded text-sm font-bold ${
                          active ? "bg-accent text-white" : "bg-surface-2 text-muted"
                        }`}
                      >
                        {n}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span
                        className={`block text-xs font-semibold ${
                          active ? "text-accent" : "text-muted"
                        }`}
                      >
                        Episode {n}
                      </span>
                      {info?.title && (
                        <span className="line-clamp-2 text-sm">{info.title}</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      {/* Recommendations Section */}
      {recs.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <AnimeRow
            title="You might also like"
            items={recs}
            href={anime.genres?.[0] ? `/search?genre=${encodeURIComponent(anime.genres[0])}` : "/search"}
          />
        </div>
      )}

    </div>
  );
}

