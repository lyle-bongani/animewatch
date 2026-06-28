import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAnime } from "@/lib/anilist";
import { WatchClient } from "@/components/WatchClient";
import { displayTitle, watchableEpisodes } from "@/lib/types";

type Params = Promise<{ id: string }>;
type SP = Promise<{ ep?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnime(Number(id));
  return { title: anime ? `Watch ${displayTitle(anime)}` : "Watch" };
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
  const anime = await getAnime(Number(id));
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
