"use client";

import Link from "next/link";
import { useAdultGate } from "./AdultGateContext";

export function Footer() {
  const { isAdultUnlocked, openModal, lockAdult } = useAdultGate();

  return (
    <footer className="mt-16 border-t border-border bg-surface pb-20 sm:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-bold text-white">
                A
              </span>
              <span className="text-lg font-bold text-foreground">
                Anime<span className="text-accent">Watch</span>
              </span>
            </Link>
            <p className="mt-3 leading-relaxed text-xs sm:text-sm">
              Discover and stream anime online. Metadata by AniList & MyAnimeList. AnimeWatch
              hosts no files — playback is provided by third-party embed servers.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 sm:gap-12">
            <nav className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Browse</span>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/series" className="hover:text-foreground transition-colors">
                TV Series
              </Link>
              <Link href="/movies" className="hover:text-foreground transition-colors">
                Movies
              </Link>
              <Link href="/donghua" className="hover:text-foreground transition-colors">
                Donghua
              </Link>
              <Link href="/manga" className="hover:text-foreground transition-colors">
                Manga / Manhwa
              </Link>
              <Link href="/genres" className="hover:text-foreground transition-colors">
                Genres
              </Link>
            </nav>

            {/* 18+ Content Lock Control in Footer */}
            <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-surface-2/60 p-4 sm:max-w-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Content Filter
                </span>
                {isAdultUnlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent border border-accent/30">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    18+ Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-300 border border-white/15">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Safe Mode (18+ Locked)
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-muted">
                {isAdultUnlocked
                  ? "18+ mature and adult content is unlocked. Click below to switch back to Safe Mode."
                  : "Straight 18+ titles are locked. Mainstream anime and clean series remain fully accessible."}
              </p>
              {isAdultUnlocked ? (
                <button
                  type="button"
                  onClick={lockAdult}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Switch to Safe Mode
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-accent/25 hover:bg-accent/90 transition-colors cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Unlock 18+ Content
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-xs">
          © {new Date().getFullYear()} AnimeWatch. For educational/demo purposes.
          This site does not store any media on its servers.
        </p>
      </div>
    </footer>
  );
}
