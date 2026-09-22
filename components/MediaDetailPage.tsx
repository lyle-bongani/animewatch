"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Anime, StreamingEpisode } from "@/lib/types";
import {
  displayTitle,
  stripHtml,
  formatLabel,
  watchableEpisodes,
  groupRelations,
  isStraight18,
  matchPercent,
  maturityLabel,
} from "@/lib/types";
import { WatchlistButton } from "@/components/WatchlistButton";
import { DownloadButton } from "@/components/DownloadButton";
import { TrailerButton } from "@/components/TrailerButton";
import { AdultDetailGate } from "@/components/AdultDetailGate";
import { AnimeRow } from "@/components/AnimeRow";

interface MediaDetailPageProps {
  anime: Anime;
  mediaType?: "anime" | "movie" | "series";
}

interface StoredHistory {
  id: number | string;
  episode?: number;
  season?: number;
  timestamp?: number;
}

export function MediaDetailPage({ anime, mediaType }: MediaDetailPageProps) {
  const isAdult = isStraight18(anime);
  const match = matchPercent(anime);
  const maturity = maturityLabel(anime);
  const isMovie = mediaType === "movie" || anime.format === "MOVIE";
  const totalEps = watchableEpisodes(anime);

  // Resume playback from watch history if user previously watched this title
  const [resumeEp, setResumeEp] = useState<{ season: number; episode: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("animewatch:history");
      if (raw) {
        const list: StoredHistory[] = JSON.parse(raw);
        const entry = list.find((item) => String(item.id) === String(anime.id));
        if (entry && entry.episode) {
          setResumeEp({
            season: entry.season || 1,
            episode: entry.episode,
          });
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, [anime.id]);

  // Group streaming episodes by season if available
  const episodesBySeason = React.useMemo(() => {
    const map = new Map<number, StreamingEpisode[]>();
    const streamEps = anime.streamingEpisodes ?? [];

    if (streamEps.length > 0) {
      for (const ep of streamEps) {
        const sNum = ep.season || 1;
        if (!map.has(sNum)) {
          map.set(sNum, []);
        }
        map.get(sNum)!.push(ep);
      }
    }

    return map;
  }, [anime.streamingEpisodes]);

  const seasonNumbers = Array.from(episodesBySeason.keys()).sort((a, b) => a - b);
  const hasMultipleSeasons = seasonNumbers.length > 1;
  const [selectedSeason, setSelectedSeason] = useState<number>(() => seasonNumbers[0] || 1);

  // Episode chunking for large standard anime episode lists (1-50, 51-100, etc.)
  const CHUNK_SIZE = 50;
  const numAnimeChunks = Math.ceil(totalEps / CHUNK_SIZE);
  const [animeChunkIdx, setAnimeChunkIdx] = useState(0);

  const activeSeasonEpisodes = episodesBySeason.get(selectedSeason) || [];

  const studios = anime.studios?.nodes.map((s) => s.name).filter(Boolean) ?? [];
  const recs =
    anime.recommendations?.nodes
      .map((n) => n.mediaRecommendation)
      .filter((m): m is Anime => !!m) ?? [];

  const { seasons: relatedSeasons, moviesAndSpecials } = groupRelations(anime);

  // Watch URL calculation
  const defaultWatchHref = isMovie
    ? `/watch/${anime.id}`
    : resumeEp
    ? `/watch/${anime.id}?season=${resumeEp.season}&ep=${resumeEp.episode}`
    : activeSeasonEpisodes.length > 0
    ? `/watch/${anime.id}?season=${activeSeasonEpisodes[0].season || 1}&ep=${activeSeasonEpisodes[0].episode || 1}`
    : `/watch/${anime.id}?ep=1`;

  const breadcrumbSection = isMovie ? "Movies" : mediaType === "series" ? "Series" : "Anime";
  const breadcrumbHref = isMovie ? "/movies" : mediaType === "series" ? "/series" : "/";

  return (
    <AdultDetailGate isAdultContent={isAdult}>
      <div className="relative min-h-screen pb-20 text-foreground">
        {/* Ambient Backdrop Banner */}
        <div className="relative h-64 w-full overflow-hidden sm:h-96 lg:h-[440px]">
          {anime.bannerImage || anime.coverImage.extraLarge ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anime.bannerImage || anime.coverImage.extraLarge || ""}
              alt=""
              className="h-full w-full object-cover object-center filter brightness-[0.65]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-surface-2 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-4 flex items-center gap-2 text-xs text-muted -mt-8 sm:-mt-12">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href={breadcrumbHref} className="hover:text-foreground transition-colors">
              {breadcrumbSection}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
              {displayTitle(anime)}
            </span>
          </nav>

          {/* Hero Header Card */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
            {/* Poster Card & Actions */}
            <div className="mx-auto w-48 shrink-0 sm:mx-0 sm:w-56 lg:w-64">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border/80 bg-surface-2 shadow-2xl ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={anime.coverImage.extraLarge ?? anime.coverImage.large ?? ""}
                  alt={displayTitle(anime)}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/40 backdrop-blur-sm">
                    {isMovie ? "Movie" : formatLabel(anime.format) || "TV"}
                  </span>
                  <span className="rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-zinc-300 border border-white/10">
                    HD
                  </span>
                </div>
              </div>

              {/* Primary Call-to-Actions */}
              <div className="mt-4 flex flex-col gap-2.5">
                <Link
                  href={defaultWatchHref}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:scale-[1.02] cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>
                    {resumeEp
                      ? `Resume S${resumeEp.season}:E${resumeEp.episode}`
                      : isMovie
                      ? "Watch Movie Now"
                      : "Watch Episode 1"}
                  </span>
                </Link>

                <WatchlistButton anime={anime} />

                <div className="flex gap-2">
                  <TrailerButton anime={anime} />
                  <DownloadButton anime={anime} />
                </div>
              </div>
            </div>

            {/* Title & Metadata Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {match != null && (
                  <span className="font-extrabold text-[color:var(--color-match)]">
                    {match}% Match
                  </span>
                )}
                <span className="rounded border border-white/25 px-1.5 py-0.5 font-bold text-zinc-200">
                  {maturity}
                </span>
                {anime.seasonYear && (
                  <span className="text-zinc-400 font-medium">{anime.seasonYear}</span>
                )}
                {anime.duration ? (
                  <span className="text-zinc-400 font-medium">{anime.duration} min</span>
                ) : totalEps > 1 ? (
                  <span className="text-zinc-400 font-medium">{totalEps} Episodes</span>
                ) : null}
                {anime.status && (
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                    {prettyStatus(anime.status)}
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white">
                {displayTitle(anime)}
              </h1>

              {anime.title.native && anime.title.native !== displayTitle(anime) && (
                <p className="mt-1 text-sm font-medium text-muted">{anime.title.native}</p>
              )}

              {/* Genres */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {anime.genres.map((g) => (
                  <Link
                    key={g}
                    href={`/search?genre=${encodeURIComponent(g)}`}
                    className="rounded-full border border-border/80 bg-surface-2/70 px-3 py-1 text-xs font-medium text-zinc-300 hover:border-accent hover:text-white transition-colors"
                  >
                    {g}
                  </Link>
                ))}
              </div>

              {/* Synopsis */}
              <div className="mt-5 rounded-2xl border border-border/70 bg-surface-2/40 p-4 sm:p-5">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Synopsis & Overview
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-200">
                  {stripHtml(anime.description) || "No synopsis available for this title."}
                </p>
              </div>

              {/* Additional Metadata Grid */}
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
                {studios.length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-surface-2/30 p-2.5">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Studios
                    </dt>
                    <dd className="mt-0.5 font-semibold text-foreground truncate">
                      {studios.join(", ")}
                    </dd>
                  </div>
                )}
                {anime.averageScore && (
                  <div className="rounded-xl border border-border/50 bg-surface-2/30 p-2.5">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Community Rating
                    </dt>
                    <dd className="mt-0.5 font-semibold text-yellow-400">
                      ★ {(anime.averageScore / 10).toFixed(1)} / 10
                    </dd>
                  </div>
                )}
                {anime.season && (
                  <div className="rounded-xl border border-border/50 bg-surface-2/30 p-2.5">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Season
                    </dt>
                    <dd className="mt-0.5 font-semibold text-foreground capitalize">
                      {anime.season.toLowerCase()} {anime.seasonYear || ""}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Episode Selection Section */}
          <section className="mt-12">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span className="h-5 w-1 rounded bg-accent" />
                {isMovie ? "Feature Film" : "Episodes & Broadcast"}
              </h2>

              {/* Multi-Season Switcher Tabs */}
              {hasMultipleSeasons && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {seasonNumbers.map((sNum) => (
                    <button
                      key={sNum}
                      onClick={() => setSelectedSeason(sNum)}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                        selectedSeason === sNum
                          ? "bg-accent text-white shadow-md shadow-accent/25"
                          : "bg-surface-2 text-muted hover:text-foreground hover:bg-surface-3"
                      }`}
                    >
                      Season {sNum}
                    </button>
                  ))}
                </div>
              )}

              {/* Anime 50-chunk selector if no explicit multi-season array */}
              {!hasMultipleSeasons && numAnimeChunks > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {Array.from({ length: numAnimeChunks }, (_, idx) => {
                    const start = idx * CHUNK_SIZE + 1;
                    const end = Math.min((idx + 1) * CHUNK_SIZE, totalEps);
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnimeChunkIdx(idx)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                          animeChunkIdx === idx
                            ? "bg-accent text-white shadow-md shadow-accent/25"
                            : "bg-surface-2 text-muted hover:text-foreground hover:bg-surface-3"
                        }`}
                      >
                        {start}–{end}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Movie Direct Player Card */}
            {isMovie ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface-2/60 p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/20 text-accent">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {displayTitle(anime)} — Full Movie
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {anime.duration ? `${anime.duration} minutes · ` : ""}Full HD Stream
                    </p>
                  </div>
                </div>

                <Link
                  href={`/watch/${anime.id}`}
                  className="rounded-xl bg-accent px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors"
                >
                  Play Movie
                </Link>
              </div>
            ) : episodesBySeason.size > 0 ? (
              /* Rich Episodic List with Season grouping & Titles */
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {activeSeasonEpisodes.map((ep) => {
                  const epNum = ep.episode || 1;
                  const epTitle = ep.title || `Episode ${epNum}`;
                  const isWatched =
                    resumeEp?.season === (ep.season || selectedSeason) &&
                    resumeEp?.episode === epNum;

                  return (
                    <Link
                      key={`${ep.season}-${epNum}`}
                      href={`/watch/${anime.id}?season=${ep.season || selectedSeason}&ep=${epNum}`}
                      className={`group flex items-center gap-3 rounded-xl border p-2.5 transition-all cursor-pointer ${
                        isWatched
                          ? "border-accent bg-accent/10 shadow-md ring-1 ring-accent"
                          : "border-border/70 bg-surface-2/70 hover:border-accent/50 hover:bg-surface-3"
                      }`}
                    >
                      {ep.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ep.thumbnail}
                          alt=""
                          loading="lazy"
                          className="h-14 w-24 rounded-lg object-cover shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="grid h-14 w-20 shrink-0 place-items-center rounded-lg bg-black/40 text-xs font-bold text-muted group-hover:text-accent">
                          EP {epNum}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase text-accent">
                            S{ep.season || selectedSeason}:E{epNum}
                          </span>
                          {isWatched && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded">
                              Last Watched
                            </span>
                          )}
                        </div>
                        <h4 className="line-clamp-1 text-xs sm:text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                          {epTitle}
                        </h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* Sequential Anime Numerical Grid */
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {Array.from(
                  {
                    length: Math.min(
                      CHUNK_SIZE,
                      totalEps - animeChunkIdx * CHUNK_SIZE
                    ),
                  },
                  (_, i) => animeChunkIdx * CHUNK_SIZE + i + 1
                ).map((n) => {
                  const isWatched = resumeEp?.episode === n;
                  return (
                    <Link
                      key={n}
                      href={`/watch/${anime.id}?ep=${n}`}
                      className={`flex flex-col items-center justify-center rounded-xl border py-3 text-center transition-all cursor-pointer ${
                        isWatched
                          ? "border-accent bg-accent text-white font-bold shadow-md shadow-accent/25 scale-105"
                          : "border-border/80 bg-surface-2/80 text-xs sm:text-sm font-semibold text-zinc-300 hover:border-accent hover:bg-surface-3 hover:text-white"
                      }`}
                    >
                      <span>{n}</span>
                      {isWatched && (
                        <span className="text-[8px] uppercase tracking-wider text-white/90">
                          Watched
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Related Seasons & Prequels/Sequels */}
          {relatedSeasons.length > 1 && (
            <section className="mt-12 border-t border-border/50 pt-8">
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
                <span className="h-5 w-1 rounded bg-accent" />
                Related Seasons & Universe
              </h2>
              <div className="flex flex-wrap gap-4">
                {relatedSeasons.map((rel) => (
                  <Link
                    key={rel.id}
                    href={rel.format === "MOVIE" ? `/movies/${rel.id}` : `/anime/${rel.id}`}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-accent/40 hover:bg-surface-3 cursor-pointer shrink-0 w-full sm:max-w-[280px] ${
                      rel.isCurrent
                        ? "border-accent bg-accent/5 ring-1 ring-accent"
                        : "border-border bg-surface-2"
                    }`}
                  >
                    {rel.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rel.cover}
                        alt={rel.title}
                        className="h-16 w-11 rounded object-cover shadow-sm shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="inline-block rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        Season {rel.seasonNumber} {rel.year ? `(${rel.year})` : ""}
                      </span>
                      <h3 className="mt-1 truncate text-sm font-semibold text-foreground/90">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-muted">
                        {rel.format} · {prettyStatus(rel.status)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Movies & Specials Grid */}
          {moviesAndSpecials.length > 0 && (
            <section className="mt-10 border-t border-border/50 pt-8">
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
                <span className="h-5 w-1 rounded bg-accent" />
                Movies & Specials
              </h2>
              <div className="flex flex-wrap gap-4">
                {moviesAndSpecials.map((rel) => (
                  <Link
                    key={rel.id}
                    href={rel.format === "MOVIE" ? `/movies/${rel.id}` : `/anime/${rel.id}`}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-accent/40 hover:bg-surface-3 cursor-pointer shrink-0 w-full sm:max-w-[280px] ${
                      rel.isCurrent
                        ? "border-accent bg-accent/5 ring-1 ring-accent"
                        : "border-border bg-surface-2"
                    }`}
                  >
                    {rel.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rel.cover}
                        alt={rel.title}
                        className="h-16 w-11 rounded object-cover shadow-sm shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="inline-block rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        {rel.relationType.replace(/_/g, " ")} {rel.year ? `(${rel.year})` : ""}
                      </span>
                      <h3 className="mt-1 truncate text-sm font-semibold text-foreground/90">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-muted">
                        {rel.format} · {prettyStatus(rel.status)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recommendations Row */}
          {recs.length > 0 && (
            <div className="mt-14 border-t border-border/50 pt-8">
              <AnimeRow
                title="You Might Also Like"
                items={recs}
                href={
                  anime.genres?.[0]
                    ? `/search?genre=${encodeURIComponent(anime.genres[0])}`
                    : "/search"
                }
              />
            </div>
          )}
        </div>
      </div>
    </AdultDetailGate>
  );
}

function prettyStatus(s: string): string {
  return (
    {
      RELEASING: "Airing",
      FINISHED: "Finished",
      NOT_YET_RELEASED: "Upcoming",
      CANCELLED: "Cancelled",
      HIATUS: "Hiatus",
    }[s] ?? s
  );
}
