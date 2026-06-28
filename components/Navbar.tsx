"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Anime } from "@/lib/types";
import { displayTitle, formatLabel } from "@/lib/types";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Live search dropdown (debounced)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
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

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-bold text-white">
            A
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            Anime<span className="text-accent">Watch</span>
          </span>
        </Link>

        <div ref={boxRef} className="relative flex-1 max-w-xl">
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
            <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
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
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/search?q=trending" className="hover:text-foreground">
            Browse
          </Link>
          <Link href="/watchlist" className="hover:text-foreground">
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
          href="/search?q=trending"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted hover:text-accent"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-[10px] font-medium">Browse</span>
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
          <div className="relative ml-auto flex h-full w-64 flex-col bg-background p-6 shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
              <span className="font-bold text-accent">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1 text-muted hover:text-foreground cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-4 text-base font-semibold">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Home
              </Link>
              <Link
                href="/search?q=trending"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-1 text-foreground hover:text-accent"
              >
                Browse
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
            <div className="mt-8 border-t border-border/60 pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-4">
                Genres
              </span>
              <div className="flex flex-col gap-3 text-sm font-medium">
                {["Action", "Comedy", "Fantasy", "Isekai", "Romance", "Sci-Fi"].map((g) => (
                  <Link
                    key={g}
                    href={g === "Isekai" ? "/" : `/search?genre=${g}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-muted hover:text-foreground"
                  >
                    {g}
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
