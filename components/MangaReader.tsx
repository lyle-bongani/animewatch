"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AsuraChapterData } from "@/lib/asura";

type MangaReaderProps = {
  data: AsuraChapterData;
  allChapters?: { number: string }[];
};

export function MangaReader({ data, allChapters = [] }: MangaReaderProps) {
  const router = useRouter();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [readerWidth, setReaderWidth] = useState<"standard" | "wide" | "full">("standard");

  // Track scroll progress
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (currentScrollY / total) * 100)));
      }
      // Show controls when scrolling up, hide when scrolling down deeply
      if (currentScrollY > 200 && currentScrollY > lastScrollY + 20) {
        setShowControls(false);
      } else if (currentScrollY < lastScrollY - 20 || currentScrollY < 100) {
        setShowControls(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "ArrowLeft" && data.prevChapter) {
        router.push(`/manga/${data.slug}/chapter/${data.prevChapter}`);
      } else if (e.key === "ArrowRight" && data.nextChapter) {
        router.push(`/manga/${data.slug}/chapter/${data.nextChapter}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data.slug, data.prevChapter, data.nextChapter, router]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const widthClass =
    readerWidth === "full"
      ? "max-w-none w-full"
      : readerWidth === "wide"
      ? "max-w-4xl"
      : "max-w-2xl sm:max-w-3xl";

  return (
    <div className="relative min-h-screen bg-black">
      {/* Top Floating Control Bar */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 border-b border-border/80 bg-background/95 backdrop-blur-md ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Progress Bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Back link & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/manga/${data.slug}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted hover:text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
              title="Back to series overview"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>

            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {data.seriesTitle || data.slug.replace(/-[0-9a-f]+$/i, "").replace(/-/g, " ")}
              </h1>
              <div className="text-[11px] text-muted flex items-center gap-1.5">
                <span className="font-semibold text-accent">Chapter {data.chapter}</span>
                <span>•</span>
                <span>{data.pages.length} Pages</span>
              </div>
            </div>
          </div>

          {/* Controls: Chapter Selector & Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Width Toggle (Desktop) */}
            <div className="hidden md:flex items-center rounded-lg border border-border bg-surface-2 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setReaderWidth("standard")}
                className={`rounded px-2 py-1 transition-colors ${
                  readerWidth === "standard" ? "bg-accent text-white font-bold" : "text-muted hover:text-foreground"
                }`}
                title="Standard webtoon width"
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setReaderWidth("wide")}
                className={`rounded px-2 py-1 transition-colors ${
                  readerWidth === "wide" ? "bg-accent text-white font-bold" : "text-muted hover:text-foreground"
                }`}
                title="Wide reader width"
              >
                Wide
              </button>
            </div>

            {/* Prev Chapter */}
            {data.prevChapter ? (
              <Link
                href={`/manga/${data.slug}/chapter/${data.prevChapter}`}
                className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
                title="Previous chapter (ArrowLeft)"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-1 rounded-lg border border-border/50 bg-surface-2/40 px-2.5 py-1.5 text-xs font-medium text-muted/40 cursor-not-allowed"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="hidden sm:inline">Prev</span>
              </button>
            )}

            {/* Chapter Selector Dropdown */}
            {allChapters.length > 0 ? (
              <select
                value={data.chapter}
                onChange={(e) => router.push(`/manga/${data.slug}/chapter/${e.target.value}`)}
                className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs font-bold text-foreground focus:border-accent focus:outline-none cursor-pointer"
              >
                {allChapters.map((ch) => (
                  <option key={ch.number} value={ch.number} className="bg-surface text-foreground">
                    Ch. {ch.number}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-bold text-foreground">
                Ch. {data.chapter}
              </span>
            )}

            {/* Next Chapter */}
            {data.nextChapter ? (
              <Link
                href={`/manga/${data.slug}/chapter/${data.nextChapter}`}
                className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-bold text-white shadow-md shadow-accent/25 hover:bg-accent/90 transition-all cursor-pointer"
                title="Next chapter (ArrowRight)"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-1 rounded-lg border border-border/50 bg-surface-2/40 px-2.5 py-1.5 text-xs font-medium text-muted/40 cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Continuous Webtoon Images Container */}
      <main className={`mx-auto pt-16 pb-20 px-0 sm:px-2 ${widthClass}`}>
        {data.pages.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-foreground">Chapter images are loading or unavailable</h2>
            <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
              The chapter pages could not be extracted from AsuraScans at this time. Please try refreshing or check back in a few moments.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href={`/manga/${data.slug}`}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90"
              >
                Back to Series
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center select-none">
            {data.pages.map((pageUrl, index) => (
              <div key={index} className="relative w-full overflow-hidden bg-black leading-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pageUrl}
                  alt={`Page ${index + 1}`}
                  loading={index < 3 ? "eager" : "lazy"}
                  className="w-full h-auto block m-0 p-0 border-0"
                  onError={(e) => {
                    // Try reloading image once if temporary CDN glitch
                    const target = e.currentTarget;
                    if (!target.dataset.retried) {
                      target.dataset.retried = "true";
                      target.src = pageUrl + (pageUrl.includes("?") ? "&" : "?") + "retry=" + Date.now();
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* End of Chapter Navigation Footer */}
        {data.pages.length > 0 && (
          <div className="mt-12 rounded-2xl border border-border/80 bg-surface/90 p-6 text-center backdrop-blur-md mx-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              End of Chapter {data.chapter}
            </h3>
            <p className="mt-1 text-xs text-muted">
              You finished reading all {data.pages.length} pages of this chapter.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {data.prevChapter && (
                <Link
                  href={`/manga/${data.slug}/chapter/${data.prevChapter}`}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span>Previous Chapter ({data.prevChapter})</span>
                </Link>
              )}

              <Link
                href={`/manga/${data.slug}`}
                className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-muted hover:text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
              >
                All Chapters
              </Link>

              {data.nextChapter ? (
                <Link
                  href={`/manga/${data.slug}/chapter/${data.nextChapter}`}
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all cursor-pointer"
                >
                  <span>Next Chapter ({data.nextChapter})</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              ) : (
                <span className="rounded-xl bg-surface-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-muted">
                  You are at the latest chapter!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m18 15-6-6-6 6" />
              </svg>
              <span>Back to Top</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
