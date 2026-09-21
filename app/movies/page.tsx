import { MoviesModeLayout } from "@/components/modes/MoviesModeLayout";
import { getCinemetaMovies } from "@/lib/cinemeta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies - Stream Hollywood & Global Blockbusters",
  description: "Watch trending Hollywood movies, action blockbusters, comedies, sci-fi sagas, and critically acclaimed films in HD.",
};

export const revalidate = 3600;

export default async function MoviesPage() {
  const [trending, action, scifi, drama, comedy] = await Promise.all([
    getCinemetaMovies(undefined, 20).catch(() => []),
    getCinemetaMovies("Action", 20).catch(() => []),
    getCinemetaMovies("Sci-Fi", 20).catch(() => []),
    getCinemetaMovies("Drama", 20).catch(() => []),
    getCinemetaMovies("Comedy", 20).catch(() => []),
  ]);

  return (
    <MoviesModeLayout
      trending={trending}
      action={action}
      scifi={scifi}
      drama={drama}
      comedy={comedy}
    />
  );
}
