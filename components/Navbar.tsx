"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Anime } from "@/lib/types";
import { displayTitle, formatLabel } from "@/lib/types";
import { ALL_GENRES } from "@/lib/genres";
import { useAppMode, type AppMode } from "@/components/ModeContext";

interface SearchDropdownResult {
  id: string | number;
  title: string | { english?: string | null; romaji?: string | null; native?: string | null };
  coverImage?: { large?: string | null } | string;
  format?: string | null;
  seasonYear?: number | string | null;
  mediaType?: "anime" | "movie" | "series" | "manga";
  href?: string;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, setMode, modesList, modeInfo } = useAppMode();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchDropdownResult[]>([]);
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
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&mode=${encodeURIComponent(mode)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: SearchDropdownResult[] };
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

  const handleModeSelect = (selectedMode: AppMode) => {
    setMode(selectedMode, true);
    setMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "border-b border-transparent bg-gradient-to-b from-black/85 via-black/40 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <Link href="/" onClick={() => handleModeSelect("anime")} className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-black text-white shadow-md shadow-accent/40">
              A
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline text-white">
              Anime<span className="text-accent">Watch</span>
            </span>
          </Link>

          {/* Desktop Persistent Mode Switcher Bar */}
          <div className="hidden lg:flex items-center gap-1 rounded-full border border-border/80 bg-surface/80 p-1 backdrop-blur-md">
            {modesList.map((m) => {
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeSelect(m.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-accent text-white shadow-md shadow-accent/30 scale-105"
                      : "text-muted hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle: Search Box */}
        <div ref={boxRef} className="relative min-w-0 flex-1 max-w-[210px] sm:max-w-xs md:max-w-sm">
          <form onSubmit={submit}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder={`Search ${modeInfo.label.toLowerCase()}…`}
              aria-label="Search"
              className="w-full rounded-full border border-border bg-surface px-4 py-1.5 sm:py-2 text-xs sm:text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted hover:text-foreground"
            >
              <SearchIcon />
            </button>
          </form>

          {open && (results.length > 0 || loading) && (
            <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-2xl z-50">
              {loading && results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted">Searching…</div>
              ) : (
                results.map((a) => {
                  const itemTitle =
                    typeof a.title === "string"
                      ? a.title
                      : a.title.english || a.title.romaji || a.title.native || "Untitled";
                  const coverSrc =
                    typeof a.coverImage === "string"
                      ? a.coverImage
                      : a.coverImage?.large ?? "";
                  const destination =
                    a.href ||
                    (a.mediaType === "movie"
                      ? `/movies/${a.id}`
                      : a.mediaType === "series"
                      ? `/series/${a.id}`
                      : a.mediaType === "manga"
                      ? `/manga/${a.id}`
                      : `/anime/${a.id}`);

                  return (
                    <Link
                      key={`${a.mediaType || "media"}-${a.id}`}
                      href={destination}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-surface-2 group cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverSrc}
                        alt=""
                        className="h-14 w-10 shrink-0 rounded object-cover shadow-sm"
                        loading="lazy"
                      />
                      <span className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {a.mediaType === "movie" ? (
                            <span className="rounded bg-blue-600/90 px-1.5 py-0.2 text-[8.5px] font-black uppercase tracking-wider text-white">
                              Movie
                            </span>
                          ) : a.mediaType === "series" ? (
                            <span className="rounded bg-emerald-600/90 px-1.5 py-0.2 text-[8.5px] font-black uppercase tracking-wider text-white">
                              Series
                            </span>
                          ) : a.mediaType === "manga" ? (
                            <span className="rounded bg-amber-600/90 px-1.5 py-0.2 text-[8.5px] font-black uppercase tracking-wider text-white">
                              Manga
                            </span>
                          ) : (
                            <span className="rounded bg-accent px-1.5 py-0.2 text-[8.5px] font-black uppercase tracking-wider text-white">
                              Anime
                            </span>
                          )}
                          {a.seasonYear && (
                            <span className="text-[10px] text-muted">{a.seasonYear}</span>
                          )}
                        </div>
                        <span className="line-clamp-1 text-xs sm:text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                          {itemTitle}
                        </span>
                      </span>
                    </Link>
                  );
                })
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

        {/* Right: Navigation Links & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-5">
          <nav className="hidden shrink-0 items-center gap-4 text-sm font-medium text-muted sm:flex">
            <Link
              href="/search?q=trending"
              className="hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/settings/extensions"
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-semibold"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Extensions
            </Link>

            {/* Genres Mega-Dropdown */}
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

          {/* Hamburger Button (Mobile Only) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-surface-2 sm:hidden cursor-pointer shadow-sm"
            aria-label="Toggle menu"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-14 border-t border-border/60 bg-background/95 pb-safe backdrop-blur-md sm:hidden">
        <button
          onClick={() => handleModeSelect("anime")}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            mode === "anime" ? "text-accent font-bold" : "text-muted hover:text-foreground"
          }`}
        >
          <span className="text-sm">⛩️</span>
          <span className="text-[10px] font-medium">Anime</span>
        </button>
        <button
          onClick={() => handleModeSelect("movies")}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            mode === "movies" ? "text-blue-500 font-bold" : "text-muted hover:text-foreground"
          }`}
        >
          <span className="text-sm">🎬</span>
          <span className="text-[10px] font-medium">Movies</span>
        </button>
        <button
          onClick={() => handleModeSelect("series")}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            mode === "series" ? "text-emerald-500 font-bold" : "text-muted hover:text-foreground"
          }`}
        >
          <span className="text-sm">📺</span>
          <span className="text-[10px] font-medium">Series</span>
        </button>
        <button
          onClick={() => handleModeSelect("manga")}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            mode === "manga" ? "text-amber-500 font-bold" : "text-muted hover:text-foreground"
          }`}
        >
          <span className="text-sm">📖</span>
          <span className="text-[10px] font-medium">Manga</span>
        </button>
        <Link
          href="/watchlist"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted hover:text-accent"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[10px] font-medium">Watchlist</span>
        </Link>
      </div>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />
          {/* Drawer Content */}
          <div className="relative ml-auto flex h-full w-80 flex-col bg-surface border-l border-border p-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded bg-accent text-xs font-bold text-white">
                  A
                </span>
                <span className="font-bold text-foreground">Layout Modes</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1 text-muted hover:text-foreground cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            {/* 4-Card Mode Switcher in Drawer */}
            <div className="mb-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2.5">
                Switch Experience Mode
              </div>
              <div className="grid grid-cols-2 gap-2">
                {modesList.map((m) => {
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleModeSelect(m.id)}
                      className={`flex flex-col items-start justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        isActive
                          ? "border-accent bg-accent/15 shadow-md shadow-accent/20 ring-1 ring-accent"
                          : "border-border/80 bg-surface-2/60 hover:bg-surface-3 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xl">{m.icon}</span>
                        {isActive && (
                          <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                        )}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`text-xs font-bold block ${
                            isActive ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {m.label} Mode
                        </span>
                        <span className="text-[9.5px] text-muted line-clamp-1 mt-0.5">
                          {m.tagline}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="border-t border-border/60 pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                Navigation
              </div>
              <nav className="flex flex-col gap-1.5 text-sm font-semibold">
                <Link
                  href="/search?q=trending"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-surface-2 hover:text-accent transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Browse All Titles</span>
                </Link>
                <Link
                  href="/genres"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-surface-2 hover:text-accent transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                  <span>Genres Directory</span>
                </Link>
                <Link
                  href="/watchlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-surface-2 hover:text-accent transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>My Watchlist</span>
                </Link>
              </nav>
            </div>

            {/* Genres Section in Mobile Drawer */}
            <div className="mt-5 border-t border-border/60 pt-4 flex-1">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Categories ({ALL_GENRES.length})
                </span>
                <Link
                  href="/genres"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs font-bold text-accent hover:underline"
                >
                  All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                {ALL_GENRES.map((g) => (
                  <Link
                    key={g.name}
                    href={g.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-surface-2/60 px-2.5 py-1.5 text-muted hover:text-foreground hover:bg-surface-3 transition-colors truncate text-[11px]"
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
      width="16"
      height="16"
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
