import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAnime } from "@/lib/anilist";
import { findCinemetaItem } from "@/lib/cinemeta";
import { MediaDetailPage } from "@/components/MediaDetailPage";
import { displayTitle, stripHtml, type Anime } from "@/lib/types";

type Params = Promise<{ id: string }>;

async function fetchMediaItem(id: string): Promise<Anime | null> {
  const cleanId = id.replace(/^(anime|movie|series)[:_-]/, "");
  if (cleanId.startsWith("tt")) {
    return findCinemetaItem(cleanId);
  }
  const numericId = Number(cleanId);
  if (!isNaN(numericId)) {
    const anime = await getAnime(numericId);
    if (anime) return anime;
  }
  return findCinemetaItem(cleanId);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const anime = await fetchMediaItem(id);
  if (!anime) return { title: "Title Not Found — AnimeWatch" };
  return {
    title: `${displayTitle(anime)} — Watch on AnimeWatch`,
    description: stripHtml(anime.description).slice(0, 160),
    openGraph: {
      title: displayTitle(anime),
      description: stripHtml(anime.description).slice(0, 160),
      images: anime.coverImage.extraLarge || anime.coverImage.large ? [anime.coverImage.extraLarge || anime.coverImage.large!] : [],
    },
  };
}

export default async function AnimeDetailsRoute({ params }: { params: Params }) {
  const { id } = await params;
  const anime = await fetchMediaItem(id);
  if (!anime) notFound();

  const isMovie = anime.format === "MOVIE";
  const isSeries = (anime.streamingEpisodes?.length ?? 0) > 1 && !isMovie;

  return (
    <MediaDetailPage
      anime={anime}
      mediaType={isMovie ? "movie" : isSeries ? "series" : "anime"}
    />
  );
}
