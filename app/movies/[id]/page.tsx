import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findCinemetaItem } from "@/lib/cinemeta";
import { getAnime } from "@/lib/anilist";
import { MediaDetailPage } from "@/components/MediaDetailPage";
import { displayTitle, stripHtml, type Anime } from "@/lib/types";

type Params = Promise<{ id: string }>;

async function fetchMovieItem(id: string): Promise<Anime | null> {
  const cleanId = id.replace(/^(movie|series|anime)[:_-]/, "");
  // Try Cinemeta movie first
  const movie = await findCinemetaItem(cleanId);
  if (movie) return movie;

  // Fallback to numeric AniList anime movie
  const numId = Number(cleanId);
  if (!isNaN(numId)) {
    return getAnime(numId);
  }
  return null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const movie = await fetchMovieItem(id);
  if (!movie) return { title: "Movie Not Found — AnimeWatch" };
  return {
    title: `Watch ${displayTitle(movie)} Full Movie — AnimeWatch`,
    description: stripHtml(movie.description).slice(0, 160),
    openGraph: {
      title: `${displayTitle(movie)} (Movie)`,
      description: stripHtml(movie.description).slice(0, 160),
      images: movie.coverImage.extraLarge || movie.coverImage.large ? [movie.coverImage.extraLarge || movie.coverImage.large!] : [],
    },
  };
}

export default async function MovieDetailsRoute({ params }: { params: Params }) {
  const { id } = await params;
  const movie = await fetchMovieItem(id);
  if (!movie) notFound();

  return <MediaDetailPage anime={movie} mediaType="movie" />;
}
