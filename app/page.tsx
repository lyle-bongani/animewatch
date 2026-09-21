import { AdaptiveHome } from "@/components/AdaptiveHome";
import {
  getTrending,
  getPopular,
  getTopRated,
  getAiringNow,
  getRecentlyAired,
  getIsekai,
} from "@/lib/anilist";
import { getCinemetaMovies, getCinemetaSeries } from "@/lib/cinemeta";
import { getAsuraLatest } from "@/lib/asura";

export const revalidate = 1800; // Cache page for 30 minutes

export default async function Home() {
  const [
    animeTrending,
    animePopular,
    animeTopRated,
    animeAiring,
    animeRecentlyAired,
    animeIsekai,
    moviesTrending,
    moviesAction,
    moviesScifi,
    moviesDrama,
    moviesComedy,
    seriesTrending,
    seriesCrime,
    seriesDrama,
    seriesAction,
    seriesComedy,
    mangaComics,
  ] = await Promise.all([
    // Anime dataset
    getTrending(20).catch(() => []),
    getPopular(18).catch(() => []),
    getTopRated(18).catch(() => []),
    getAiringNow(18).catch(() => []),
    getRecentlyAired(12).catch(() => []),
    getIsekai(18).catch(() => []),

    // Movies dataset
    getCinemetaMovies(undefined, 20).catch(() => []),
    getCinemetaMovies("Action", 20).catch(() => []),
    getCinemetaMovies("Sci-Fi", 20).catch(() => []),
    getCinemetaMovies("Drama", 20).catch(() => []),
    getCinemetaMovies("Comedy", 20).catch(() => []),

    // Series dataset
    getCinemetaSeries(undefined, 20).catch(() => []),
    getCinemetaSeries("Crime", 20).catch(() => []),
    getCinemetaSeries("Drama", 20).catch(() => []),
    getCinemetaSeries("Action", 20).catch(() => []),
    getCinemetaSeries("Comedy", 20).catch(() => []),

    // Manga dataset
    getAsuraLatest(1).catch(() => []),
  ]);

  return (
    <AdaptiveHome
      animeData={{
        trending: animeTrending,
        popular: animePopular,
        topRated: animeTopRated,
        airing: animeAiring,
        recentlyAired: animeRecentlyAired,
        isekai: animeIsekai,
      }}
      moviesData={{
        trending: moviesTrending,
        action: moviesAction,
        scifi: moviesScifi,
        drama: moviesDrama,
        comedy: moviesComedy,
      }}
      seriesData={{
        trending: seriesTrending,
        crime: seriesCrime,
        drama: seriesDrama,
        action: seriesAction,
        comedy: seriesComedy,
      }}
      mangaData={{
        comics: mangaComics,
      }}
    />
  );
}
