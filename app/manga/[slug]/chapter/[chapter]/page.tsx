import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAsuraChapterPages, getAsuraComic } from "@/lib/asura";
import { MangaReader } from "@/components/MangaReader";

type ChapterPageProps = {
  params: Promise<{ slug: string; chapter: string }>;
};

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const comic = await getAsuraComic(slug);
  const title = comic?.title || slug.replace(/-[0-9a-f]+$/i, "").replace(/-/g, " ");

  return {
    title: `${title} - Chapter ${chapter} - Read Online - AnimeWatch`,
    description: `Read ${title} Chapter ${chapter} online with continuous high-definition webtoon viewer on AnimeWatch.`,
  };
}

export default async function MangaChapterPage({ params }: ChapterPageProps) {
  const { slug, chapter } = await params;

  const [chapterData, comic] = await Promise.all([
    getAsuraChapterPages(slug, chapter),
    getAsuraComic(slug),
  ]);

  if (!chapterData && !comic) {
    notFound();
  }

  // Ensure title and accurate prev/next chapters
  const allChapters = comic?.chapters || [];
  let prevChapter = chapterData?.prevChapter || null;
  let nextChapter = chapterData?.nextChapter || null;

  if (allChapters.length > 0) {
    const currentIndex = allChapters.findIndex(
      (c) => c.number === chapter || parseFloat(c.number) === parseFloat(chapter)
    );
    if (currentIndex > -1) {
      if (!prevChapter && currentIndex > 0) {
        prevChapter = allChapters[currentIndex - 1].number;
      }
      if (!nextChapter && currentIndex < allChapters.length - 1) {
        nextChapter = allChapters[currentIndex + 1].number;
      }
    }
  }

  const resolvedData = {
    slug,
    chapter,
    seriesTitle: comic?.title || chapterData?.seriesTitle,
    pages: chapterData?.pages || [],
    prevChapter,
    nextChapter,
  };

  return (
    <MangaReader
      data={resolvedData}
      allChapters={allChapters.map((c) => ({ number: c.number }))}
    />
  );
}
