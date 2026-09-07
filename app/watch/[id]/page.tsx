import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAnime } from "@/lib/anilist";
import { findCinemetaItem } from "@/lib/cinemeta";
import { WatchClient } from "@/components/WatchClient";
import { displayTitle, watchableEpisodes, type Anime } from "@/lib/types";

type Params = Promise<{ id: string }>;
type SP = Promise<{ ep?: string }>;

async function fetchMediaItem(id: string): Promise<Anime | null> {
  if (id.startsWith("tt") || id.startsWith("movie") || id.startsWith("series")) {
    return findCinemetaItem(id);
  }
  const numericId = Number(id);
  if (!isNaN(numericId)) {
    const anime = await getAnime(numericId);
    if (anime) return anime;
  }
  return findCinemetaItem(id);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const item = await fetchMediaItem(id);
  return { title: item ? `Watch ${displayTitle(item)}` : "Watch" };
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}) {
  const { id } = await params;
  const { ep } = await searchParams;
  const anime = await fetchMediaItem(id);
  if (!anime) notFound();

  const totalEpisodes = watchableEpisodes(anime);
  const initialEpisode = Math.min(
    Math.max(1, parseInt(ep ?? "1", 10) || 1),
    totalEpisodes,
  );

  return (
    <WatchClient
      anime={anime}
      totalEpisodes={totalEpisodes}
      initialEpisode={initialEpisode}
      streamingEpisodes={anime.streamingEpisodes ?? []}
    />
  );
}
