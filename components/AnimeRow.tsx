import Link from "next/link";
import type { Anime } from "@/lib/types";
import { AnimeCard } from "./AnimeCard";

export function AnimeRow({
  title,
  items,
  href,
}: {
  title: string;
  items: Anime[];
  href?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">
          <span className="mr-2 inline-block h-5 w-1 rounded bg-accent align-middle" />
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {items.map((a) => (
          <div key={a.id} className="w-36 shrink-0 sm:w-40 md:w-44">
            <AnimeCard anime={a} />
          </div>
        ))}
      </div>
    </section>
  );
}
