import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAsuraComic } from "@/lib/asura";
import { MangaChapterList } from "@/components/MangaChapterList";

type MangaDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: MangaDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const comic = await getAsuraComic(slug);
  if (!comic) {
    return { title: "Manga Not Found - AnimeWatch" };
  }

  return {
    title: `Read ${comic.title} Online - AnimeWatch`,
    description: comic.synopsis.slice(0, 160),
    openGraph: {
      title: `${comic.title} - Free Manhwa & Manga Online`,
      description: comic.synopsis.slice(0, 160),
      images: comic.cover ? [{ url: comic.cover }] : [],
    },
  };
}

export default async function MangaDetailPage({ params }: MangaDetailProps) {
  const { slug } = await params;
  const comic = await getAsuraComic(slug);

  if (!comic) {
    notFound();
  }

  const firstChapter = comic.chapters.length > 0 ? comic.chapters[0] : null;
  const latestChapter =
    comic.chapters.length > 0 ? comic.chapters[comic.chapters.length - 1] : null;

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background Ambient Backdrop */}
      <div className="absolute inset-x-0 top-0 h-[480px] overflow-hidden opacity-25 filter blur-3xl pointer-events-none -mt-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comic.cover}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/manga" className="hover:text-foreground transition-colors">
            Manga
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
            {comic.title}
          </span>
        </nav>

        {/* Series Header Banner */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          {/* Cover Poster */}
          <div className="w-48 sm:w-56 md:w-64 shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border/80 bg-surface-2 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comic.cover}
                alt={comic.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 rounded-md bg-black/80 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-accent border border-accent/40 backdrop-blur-sm shadow-md">
                {comic.status}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              {firstChapter && (
                <Link
                  href={`/manga/${comic.slug}/chapter/${firstChapter.number}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Read Chapter 1</span>
                </Link>
              )}

              {latestChapter && latestChapter.number !== firstChapter?.number && (
                <Link
                  href={`/manga/${comic.slug}/chapter/${latestChapter.number}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  <span>Read Latest (Ch. {latestChapter.number})</span>
                </Link>
              )}
            </div>
          </div>

          {/* Details & Information */}
          <div className="flex flex-1 flex-col items-start gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 border border-white/10">
                {comic.chapters.length} Chapters
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 border border-white/10">
                AsuraScans Official
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              {comic.title}
            </h1>

            {/* Genre tags */}
            {comic.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {comic.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-lg border border-border/80 bg-surface-2/80 px-2.5 py-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="mt-2 rounded-2xl border border-border/70 bg-surface-2/40 p-4 sm:p-5 w-full">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Synopsis
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-300 whitespace-pre-line">
                {comic.synopsis || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <MangaChapterList slug={comic.slug} chapters={comic.chapters} />
      </div>
    </div>
  );
}
