import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findCinemetaItem } from "@/lib/cinemeta";
import { getAnime } from "@/lib/anilist";
import { MediaDetailPage } from "@/components/MediaDetailPage";
import { displayTitle, stripHtml, type Anime } from "@/lib/types";

type Params = Promise<{ id: string }>;

async function fetchSeriesItem(id: string): Promise<Anime | null> {
  const cleanId = id.replace(/^(series|movie|anime)[:_-]/, "");
  // Try Cinemeta series first
  const series = await findCinemetaItem(cleanId);
  if (series) return series;

  // Fallback to numeric AniList anime series
  const numId = Number(cleanId);
  if (!isNaN(numId)) {
    return getAnime(numId);
  }
  return null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const series = await fetchSeriesItem(id);
  if (!series) return { title: "Series Not Found — AnimeWatch" };
  return {
    title: `Watch ${displayTitle(series)} TV Series — AnimeWatch`,
    description: stripHtml(series.description).slice(0, 160),
    openGraph: {
      title: `${displayTitle(series)} (TV Series)`,
      description: stripHtml(series.description).slice(0, 160),
      images: series.coverImage.extraLarge || series.coverImage.large ? [series.coverImage.extraLarge || series.coverImage.large!] : [],
    },
  };
}

export default async function SeriesDetailsRoute({ params }: { params: Params }) {
  const { id } = await params;
  const series = await fetchSeriesItem(id);
  if (!series) notFound();

  return <MediaDetailPage anime={series} mediaType="series" />;
}
