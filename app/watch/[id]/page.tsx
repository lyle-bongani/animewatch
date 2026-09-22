import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAnime } from "@/lib/anilist";
import { findCinemetaItem } from "@/lib/cinemeta";
import { WatchClient } from "@/components/WatchClient";
import { displayTitle, watchableEpisodes, type Anime } from "@/lib/types";

type Params = Promise<{ id: string }>;
type SP = Promise<{ ep?: string; season?: string }>;

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
  const item = await fetchMediaItem(id);
  return { title: item ? `Watch ${displayTitle(item)} Online — AnimeWatch` : "Watch — AnimeWatch" };
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}) {
  const { id } = await params;
  const { ep, season } = await searchParams;
  const anime = await fetchMediaItem(id);
  if (!anime) notFound();

  const totalEpisodes = watchableEpisodes(anime);
  const initialEp = Math.max(1, parseInt(ep ?? "1", 10) || 1);
  const initialSeason = Math.max(1, parseInt(season ?? "1", 10) || 1);

  return (
    <WatchClient
      anime={anime}
      totalEpisodes={totalEpisodes}
      initialEpisode={initialEp}
      initialSeason={initialSeason}
      streamingEpisodes={anime.streamingEpisodes ?? []}
    />
  );
}
