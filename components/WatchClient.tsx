"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SERVERS, getServer, type AudioType } from "@/lib/servers";
import type { Anime, StreamingEpisode } from "@/lib/types";
import { displayTitle, stripHtml, formatLabel, groupRelations } from "@/lib/types";
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
  const [episode, setEpisode] = useState(initialEpisode);
  const [serverId, setServerId] = useState(SERVERS[0].id);
  const [type, setType] = useState<AudioType>("sub");
  const [search, setSearch] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [lightOff, setLightOff] = useState(false);

  const server = getServer(serverId);
  const slug = (anime.title.english || anime.title.romaji || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const src = server.build({ anilistId: anime.id, malId: anime.idMal, episode, type, slug });

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
            <iframe
              key={iframeKey}
              src={src}
              title={`${displayTitle(anime)} — Episode ${episode}`}
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="origin"
              className="h-full w-full"
            />
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
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      s.id === serverId
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-muted hover:text-foreground"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
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

