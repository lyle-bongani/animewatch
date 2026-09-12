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
