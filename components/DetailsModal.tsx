"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Anime } from "@/lib/types";
import {
  displayTitle,
  stripHtml,
  matchPercent,
  maturityLabel,
  directorName,
  castNames,
  watchableEpisodes,
} from "@/lib/types";
import { WatchlistButton } from "./WatchlistButton";

export function DetailsModal({ anime }: { anime: Anime }) {
  const router = useRouter();
  const [muted, setMuted] = useState(true);

  const close = () => router.back();

  // Esc to close + lock background scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const match = matchPercent(anime);
  const eps = watchableEpisodes(anime);
  const director = directorName(anime);
  const cast = castNames(anime, 4);
  const studios = anime.studios?.nodes.map((s) => s.name).filter(Boolean) ?? [];
  const recs =
    anime.recommendations?.nodes
      .map((n) => n.mediaRecommendation)
      .filter((m): m is Anime => !!m) ?? [];

  const isYouTube = anime.trailer?.site === "youtube" && anime.trailer.id;
  const heroImg = anime.bannerImage ?? anime.coverImage.extraLarge ?? anime.coverImage.large ?? "";

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-sm sm:p-6"
      onClick={close}
    >
      <div
        className="animate-modal-pop relative my-0 h-fit w-full max-w-3xl overflow-hidden rounded-none bg-surface shadow-2xl sm:my-4 sm:rounded-[var(--radius-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Hero banner (auto-play trailer with mute control) ── */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {isYouTube ? (
            <iframe
              key={muted ? "muted" : "unmuted"}
              src={`https://www.youtube.com/embed/${anime.trailer!.id}?autoplay=1&mute=${
                muted ? 1 : 0
              }&controls=0&loop=1&playlist=${anime.trailer!.id}&modestbranding=1&rel=0`}
              title={`${displayTitle(anime)} trailer`}
              allow="autoplay; encrypted-media"
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />

          {/* Close */}
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Mute toggle */}
          {isYouTube && (
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="absolute bottom-24 right-4 grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-black/40 text-white transition-colors hover:border-white"
            >
              {muted ? <MutedIcon /> : <SoundIcon />}
            </button>
          )}

          {/* Title + primary CTAs over the hero */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <h1 className="type-display max-w-lg text-2xl uppercase text-white sm:text-4xl">
              {displayTitle(anime)}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/watch/${anime.id}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-accent px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-hover"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </Link>
              <div className="w-44">
                <WatchlistButton anime={anime} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Metadata body ── */}
        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_240px] sm:p-7">
          <div>
            {/* Match | Maturity | Duration */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {match != null && (
                <span className="font-bold text-[color:var(--color-match)]">{match}% Match</span>
              )}
              {anime.seasonYear && <span className="text-foreground">{anime.seasonYear}</span>}
              <span className="rounded border border-border px-1.5 py-0.5 text-xs text-muted">
                {maturityLabel(anime)}
              </span>
              {anime.duration && <span className="text-muted">{anime.duration}m</span>}
              <span className="rounded bg-white/15 px-1.5 text-xs text-zinc-200">HD</span>
            </div>

            <p className="type-body mt-4 text-sm text-foreground/85">
              {stripHtml(anime.description) || "No synopsis available."}
            </p>
          </div>

          {/* Right metadata blocks */}
          <div className="space-y-3 text-sm">
            {cast.length > 0 && (
              <p className="text-muted">
                <span className="text-zinc-500">Cast: </span>
                <span className="text-foreground/90">{cast.join(", ")}</span>
              </p>
            )}
            {director && (
              <p className="text-muted">
                <span className="text-zinc-500">Director: </span>
                <span className="text-foreground/90">{director}</span>
              </p>
            )}
            {studios.length > 0 && (
              <p className="text-muted">
                <span className="text-zinc-500">Studio: </span>
                <span className="text-foreground/90">{studios.join(", ")}</span>
              </p>
            )}
            {anime.genres.length > 0 && (
              <p className="text-muted">
                <span className="text-zinc-500">Genres: </span>
                <span className="text-foreground/90">{anime.genres.slice(0, 4).join(", ")}</span>
              </p>
            )}
          </div>
        </div>

        {/* ── Episode selector (three-column grid) ── */}
        {eps > 0 && (
          <div className="px-5 pb-6 sm:px-7">
            <h2 className="type-title mb-3 text-lg">Episodes</h2>
            <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {Array.from({ length: Math.min(eps, 60) }, (_, i) => i + 1).map((n) => {
                const info = anime.streamingEpisodes?.[n - 1];
                return (
                  <Link
                    key={n}
                    href={`/watch/${anime.id}?ep=${n}`}
                    className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface-2 p-2 transition-colors hover:border-accent hover:bg-surface-input"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-black/40 text-sm font-bold text-muted">
                      {n}
                    </span>
                    <span className="min-w-0 text-xs">
                      <span className="block font-semibold text-foreground/90">Episode {n}</span>
                      {info?.title && (
                        <span className="line-clamp-1 text-muted">{info.title}</span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── More Like This ── */}
        {recs.length > 0 && (
          <div className="border-t border-border px-5 py-6 sm:px-7">
            <h2 className="type-title mb-4 text-lg">More Like This</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {recs.slice(0, 8).map((r) => (
                <Link
                  key={r.id}
                  href={`/anime/${r.id}`}
                  className="group overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-2"
                >
                  <div className="aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.bannerImage ?? r.coverImage.large ?? ""}
                      alt={displayTitle(r)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="line-clamp-2 p-2 text-xs font-medium text-foreground/90">
                    {displayTitle(r)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MutedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m23 9-6 6M17 9l6 6" />
    </svg>
  );
}
function SoundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
    </svg>
  );
}
