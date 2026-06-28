import type { Anime } from "@/lib/types";
import { AnimeCard } from "./AnimeCard";

export function AnimeGrid({ items }: { items: Anime[] }) {
  if (items.length === 0) {
    return <p className="py-12 text-center text-muted">No anime found.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((a) => (
        <AnimeCard key={a.id} anime={a} />
      ))}
    </div>
  );
}
