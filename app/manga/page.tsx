import type { Metadata } from "next";
import Link from "next/link";
import { getAsuraLatest, searchAsura } from "@/lib/asura";
import { MangaModeLayout } from "@/components/modes/MangaModeLayout";
import { MangaSearchBar } from "@/components/MangaSearchBar";
import { MangaCard } from "@/components/MangaCard";

export const metadata: Metadata = {
  title: "Read Manga & Manhwa Online - AnimeWatch",
  description:
    "Read the latest Manhwa, Manga, and Webtoons with high-quality chapter reader. Updated directly with latest chapters from AsuraScans.",
};

export const revalidate = 1800;

type MangaPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function MangaPage({ searchParams }: MangaPageProps) {
  const { q } = await searchParams;
  const isSearch = Boolean(q?.trim());

  const comics = isSearch ? await searchAsura(q!.trim()).catch(() => []) : await getAsuraLatest().catch(() => []);

  if (!isSearch) {
    return <MangaModeLayout comics={comics} />;
  }

  return (
    <div className="min-h-screen pb-16 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider sm:text-2xl text-foreground flex items-center gap-2.5">
              <span className="inline-block h-5 w-1.5 rounded bg-amber-500" />
              Search Results for &ldquo;{q}&rdquo;
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Found {comics.length} series matching your search query.
            </p>
          </div>

          <MangaSearchBar initialQuery={q} />
        </div>

        {comics.length === 0 ? (
          <div className="rounded-2xl border border-border/80 bg-surface-2/40 p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 text-muted">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-foreground">No series found</h3>
            <p className="mt-1 text-xs text-muted max-w-md mx-auto">
              We couldn&apos;t find any manga or manhwa matching &ldquo;{q}&rdquo;. Try searching for different keywords or browse the latest updates.
            </p>
            <div className="mt-5">
              <Link
                href="/manga"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 transition-colors"
              >
                Clear Search & View Latest
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
            {comics.map((comic) => (
              <MangaCard key={comic.slug} comic={comic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
