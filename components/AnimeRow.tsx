"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Anime } from "@/lib/types";
import { AnimeCard } from "./AnimeCard";

export function AnimeRow({
  title,
  items,
  href,
  numbered = false,
}: {
  title: string;
  items: Anime[];
  href?: string;
  /** Render large ranking numbers behind each card (Trending Poster Card). */
  numbered?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollByPage = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="group/row mx-auto max-w-7xl px-4">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="type-row text-base font-bold text-zinc-200 sm:text-xl">{title}</h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-xs font-medium text-muted opacity-0 transition-all hover:text-foreground group-hover/row:opacity-100"
          >
            Explore all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Left scroll arrow (desktop, on row hover) */}
        <button
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll left"
          className="absolute inset-y-10 left-0 z-40 hidden w-12 items-center justify-center rounded-r-[var(--radius-card)] bg-background/60 text-white opacity-0 transition-opacity hover:bg-background/80 group-hover/row:opacity-100 sm:flex"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* nflx-row drives the sibling hover physics defined in globals.css.
            Generous vertical padding gives the hover-scaled card room so it
            isn't clipped by the horizontal scroll container. */}
        <div
          ref={scroller}
          className="nflx-row no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-10 sm:gap-4"
        >
          {items.map((a, i) => (
            <div
              key={a.id}
              className={`nflx-item shrink-0 ${
                numbered ? "flex w-56 items-end gap-1 sm:w-60" : "w-36 sm:w-40 md:w-44"
              }`}
            >
              {numbered && (
                <span
                  aria-hidden
                  className="select-none text-[5.5rem] font-black leading-[0.8] text-transparent sm:text-[7rem]"
                  style={{ WebkitTextStroke: "2px var(--color-border)" }}
                >
                  {i + 1}
                </span>
              )}
              <div className={numbered ? "w-32 shrink-0 sm:w-36" : "w-full"}>
                <AnimeCard anime={a} />
              </div>
            </div>
          ))}
        </div>

        {/* Right scroll arrow */}
        <button
          onClick={() => scrollByPage(1)}
          aria-label="Scroll right"
          className="absolute inset-y-10 right-0 z-40 hidden w-12 items-center justify-center rounded-l-[var(--radius-card)] bg-background/60 text-white opacity-0 transition-opacity hover:bg-background/80 group-hover/row:opacity-100 sm:flex"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
