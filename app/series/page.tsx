import { SeriesModeLayout } from "@/components/modes/SeriesModeLayout";
import { getCinemetaSeries } from "@/lib/cinemeta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows & Series - Stream Binge-Worthy TV Hits",
  description: "Watch trending TV series, crime dramas, comedies, sci-fi shows, and multi-season sagas in HD.",
};

export const revalidate = 3600;

export default async function SeriesPage() {
  const [trending, crime, drama, action, comedy] = await Promise.all([
    getCinemetaSeries(undefined, 20).catch(() => []),
    getCinemetaSeries("Crime", 20).catch(() => []),
    getCinemetaSeries("Drama", 20).catch(() => []),
    getCinemetaSeries("Action", 20).catch(() => []),
    getCinemetaSeries("Comedy", 20).catch(() => []),
  ]);

  return (
    <SeriesModeLayout
      trending={trending}
      crime={crime}
      drama={drama}
      action={action}
      comedy={comedy}
    />
  );
}
