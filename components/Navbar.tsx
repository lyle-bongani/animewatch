"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Anime } from "@/lib/types";
import { displayTitle, formatLabel } from "@/lib/types";
import { ALL_GENRES } from "@/lib/genres";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const genresRef = useRef<HTMLDivElement>(null);

  // Netflix-style header: transparent over the hero, solid once scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live search dropdown (debounced)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale results when the query is too short
      setResults([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: Anime[] };
        setResults(data.results.slice(0, 6));
        setOpen(true);
      } catch {
        /* aborted or failed — ignore */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (genresRef.current && !genresRef.current.contains(e.target as Node)) {
        setGenresOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur"
          : "border-b border-transparent bg-gradient-to-b from-black/80 via-black/40 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-bold text-white">
            A
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            Anime<span className="text-accent">Watch</span>
          </span>
        </Link>

        <div ref={boxRef} className="relative min-w-0 flex-1 max-w-[280px] sm:max-w-xs md:max-w-sm">
          <form onSubmit={submit}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search anime…"
              aria-label="Search anime"
              className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted hover:text-foreground"
            >
              <SearchIcon />
            </button>
          </form>

          {open && (results.length > 0 || loading) && (
            <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-2xl z-50">
              {loading && results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted">Searching…</div>
              ) : (
                results.map((a) => (
                  <Link
                    key={a.id}
                    href={`/anime/${a.id}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-3 py-2 transition-colors hover:bg-surface-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.coverImage.large ?? ""}
                      alt=""
                      className="h-16 w-12 shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm font-medium">
                        {displayTitle(a)}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {[formatLabel(a.format), a.seasonYear].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </Link>
                ))
              )}
              <button
                onClick={submit}
                className="block w-full border-t border-border px-4 py-2 text-left text-sm text-accent hover:bg-surface-2"
              >
                See all results for “{query.trim()}”
              </button>
            </div>
          )}
        </div>

        {/* Hamburger Button (Mobile Only) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-surface-2 sm:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav className="hidden shrink-0 items-center gap-5 text-sm font-medium text-muted sm:flex">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/series" className="hover:text-foreground transition-colors">
            Series
          </Link>
          <Link href="/movies" className="hover:text-foreground transition-colors">
            Movies
          </Link>
          <Link href="/new" className="hover:text-foreground transition-colors">
            New
          </Link>
          <Link href="/manga" className="hover:text-foreground transition-colors">
            Manga
          </Link>
          <Link href="/search?q=trending" className="hover:text-foreground transition-colors">
            Browse
          </Link>

          {/* Genres Mega-Dropdown (Grouping Isekai, Donghua, Ecchi, Harem, Fantasy, and all genres) */}
          <div
            ref={genresRef}
            className="relative"
            onMouseEnter={() => setGenresOpen(true)}
            onMouseLeave={() => setGenresOpen(false)}
          >
            <Link
              href="/genres"
              onClick={() => setGenresOpen(false)}
              className={`flex items-center gap-1.5 py-2 hover:text-foreground transition-colors ${
                genresOpen ? "text-foreground font-semibold" : ""
              }`}
            >
              <span>Genres</span>
              <svg
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  genresOpen ? "rotate-180 text-accent" : "text-muted"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>

            {genresOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface/98 backdrop-blur-xl p-4 sm:p-5 shadow-2xl z-50 animate-fade-in">
                <div className="mb-3 flex items-center justify-between border-b border-border/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Spotlight Categories
                    </span>
                  </div>
                  <Link
                    href="/genres"
                    onClick={() => setGenresOpen(false)}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    All Directory ({ALL_GENRES.length})
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Spotlight 6 Cards */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {ALL_GENRES.filter((g) => g.featured).map((g) => (
                    <Link
                      key={g.name}
                      href={g.href}
                      onClick={() => setGenresOpen(false)}
                      className="group flex flex-col justify-between rounded-xl border border-border/70 bg-surface-2/60 p-2 hover:border-accent/60 hover:bg-surface-3 transition-all cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-bold text-foreground group-hover:text-accent transition-colors block truncate">
                          {g.name}
                        </span>
                        <span className="text-[9.5px] font-medium text-muted block mt-0.5 truncate">
                          {g.tag}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Full A-Z Genre Grid */}
                <div className="border-t border-border/80 pt-2.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted mb-1.5">
                    All Genres (A to Z)
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs max-h-44 overflow-y-auto pr-1">
                    {ALL_GENRES.map((g) => (
                      <Link
                        key={g.name}
                        href={g.href}
                        onClick={() => setGenresOpen(false)}
                        className="rounded px-1.5 py-0.5 text-muted hover:text-accent hover:bg-surface-2 transition-colors truncate"
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 border-t border-border/70 pt-2.5 flex items-center justify-between">
                  <span className="text-[10.5px] text-muted truncate">
                    {ALL_GENRES.length} Categories Available
                  </span>
                  <Link
                    href="/genres"
                    onClick={() => setGenresOpen(false)}
                    className="rounded-lg bg-accent/10 px-3 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-colors shrink-0"
                  >
                    Browse Directory →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/watchlist" className="hover:text-foreground transition-colors">
            Watchlist
          </Link>
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-14 border-t border-border/60 bg-background/95 pb-safe backdrop-blur sm:hidden">
        <Link
          href="/"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted hover:text-accent"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          href="/series"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted hover:text-accent"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M17 2l-5 5-5-5" />
          </svg>
          <span className="text-[10px] font-medium">Series</span>
        </Link>
        <Link
          href="/movies"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted hover:text-accent"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
          </svg>
          <span className="text-[10px] font-medium">Movies</span>
        </Link>
        <Link
          href="/genres"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted hover:text-accent"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span className="text-[10px] font-medium">Genres</span>
        </Link>
        <Link
          href="/watchlist"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted hover:text-accent"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[10px] font-medium">Watchlist</span>
        </Link>
      </div>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Drawer Content */}
          <div className="relative ml-auto flex h-full w-72 flex-col bg-background p-6 shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
              <span className="font-bold text-accent">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1 text-muted hover:text-foreground cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-3 text-base font-semibold">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Home
              </Link>
              <Link
                href="/series"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Series
              </Link>
              <Link
                href="/movies"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Movies
              </Link>
              <Link
                href="/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                New & Popular
              </Link>
              <Link
                href="/manga"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Manga / Manhwa
              </Link>
              <Link
                href="/search?q=trending"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Browse
              </Link>
              <Link
                href="/genres"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Genres Directory
              </Link>
              <Link
                href="/watchlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Watchlist
              </Link>
            </nav>

            {/* Genres Section */}
            <div className="mt-6 border-t border-border/60 pt-4 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  All Genres
                </span>
                <Link
                  href="/genres"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  View All ({ALL_GENRES.length}) →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium overflow-y-auto pr-1">
                {ALL_GENRES.map((g) => (
                  <Link
                    key={g.name}
                    href={g.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-surface-2/60 px-2.5 py-1.5 text-muted hover:text-foreground hover:bg-surface-3 transition-colors truncate"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
