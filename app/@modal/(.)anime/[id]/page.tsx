import { getAnime } from "@/lib/anilist";
import { DetailsModal } from "@/components/DetailsModal";

type Params = Promise<{ id: string }>;

// Intercepts /anime/[id] on client-side navigation and renders it as a modal
// over the current feed. Hard navigation / refresh falls through to the full
// page at app/anime/[id]/page.tsx.
export default async function InterceptedAnimeModal({ params }: { params: Params }) {
  const { id } = await params;
  const anime = await getAnime(Number(id));
  if (!anime) return null;
  return <DetailsModal anime={anime} />;
}
