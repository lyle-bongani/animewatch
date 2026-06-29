import Link from "next/link";
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
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="type-title text-xl sm:text-2xl">
          <span className="mr-2 inline-block h-5 w-1 rounded bg-accent align-middle" />
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        )}
      </div>

      {/* nflx-row drives the sibling hover physics defined in globals.css */}
      <div className="nflx-row no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 py-6">
        {items.map((a, i) => (
          <div
            key={a.id}
            className={`nflx-item shrink-0 ${
              numbered ? "flex items-end gap-1 w-56 sm:w-60" : "w-36 sm:w-40 md:w-44"
            }`}
          >
            {numbered && (
              <span
                aria-hidden
                className="select-none text-[5.5rem] font-black leading-[0.8] text-transparent sm:text-[7rem]"
                style={{
                  WebkitTextStroke: "2px var(--color-border)",
                }}
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
    </section>
  );
}
