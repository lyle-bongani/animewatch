import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-bold text-white">
                A
              </span>
              <span className="text-lg font-bold text-foreground">
                Anime<span className="text-accent">Watch</span>
              </span>
            </Link>
            <p className="mt-3 leading-relaxed">
              Discover and stream anime online. Metadata by AniList. AnimeWatch
              hosts no files — playback is provided by third-party embed servers.
            </p>
          </div>
          <nav className="flex gap-12">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Browse</span>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/search?q=trending" className="hover:text-foreground">
                Trending
              </Link>
              <Link href="/search?q=movie" className="hover:text-foreground">
                Movies
              </Link>
            </div>
          </nav>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-xs">
          © {new Date().getFullYear()} AnimeWatch. For educational/demo purposes.
          This site does not store any media on its servers.
        </p>
      </div>
    </footer>
  );
}
