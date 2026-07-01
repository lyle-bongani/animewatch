import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnime } from "@/lib/anilist";
import { AnimeRow } from "@/components/AnimeRow";
import { WatchlistButton } from "@/components/WatchlistButton";
import { DetailEpisodes } from "@/components/DetailEpisodes";
import {
  displayTitle,
  stripHtml,
  formatLabel,
  watchableEpisodes,
  type Anime,
} from "@/lib/types";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnime(Number(id));
  if (!anime) return { title: "Not found" };
  return {
    title: displayTitle(anime),
    description: stripHtml(anime.description).slice(0, 160),
  };
}

export default async function AnimeDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const anime = await getAnime(Number(id));
  if (!anime) notFound();

  const eps = watchableEpisodes(anime);
  const studios = anime.studios?.nodes.map((s) => s.name).filter(Boolean) ?? [];
  const recs =
    anime.recommendations?.nodes
      .map((n) => n.mediaRecommendation)
      .filter((m): m is Anime => !!m) ?? [];

  const meta: [string, string | number | null | undefined][] = [
    ["Format", formatLabel(anime.format)],
    ["Episodes", anime.episodes ?? eps],
    ["Duration", anime.duration ? `${anime.duration} min` : null],
    ["Status", anime.status ? prettyStatus(anime.status) : null],
    ["Season", [anime.season, anime.seasonYear].filter(Boolean).join(" ")],
    ["Studio", studios.join(", ")],
    ["Score", anime.averageScore ? `${anime.averageScore}%` : null],
  ];

  return (
    <div>
      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        {anime.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={anime.bannerImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface-2" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/30" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="-mt-28 flex flex-col gap-6 sm:flex-row sm:gap-8">
          {/* Poster */}
          <div className="mx-auto w-44 shrink-0 sm:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={anime.coverImage.extraLarge ?? anime.coverImage.large ?? ""}
              alt={displayTitle(anime)}
              className="w-full rounded-xl ring-1 ring-border shadow-2xl"
            />
            <Link
              href={`/watch/${anime.id}`}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover shadow-lg shadow-accent/25"
            >
              <PlayIcon /> Watch Now
            </Link>
            <WatchlistButton anime={anime} />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 sm:pt-28">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
              {displayTitle(anime)}
            </h1>
            {anime.title.native && (
              <p className="mt-1 text-sm text-muted">{anime.title.native}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  href={`/search?q=${encodeURIComponent(g)}`}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted hover:border-accent hover:text-foreground"
                >
                  {g}
                </Link>
              ))}
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-foreground/85">
              {stripHtml(anime.description) || "No synopsis available."}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 md:max-w-2xl">
              {meta
                .filter(([, v]) => v !== null && v !== undefined && v !== "")
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>

        {/* Related Seasons & Series */}
        {(() => {
          const relations = anime.relations?.edges
            ?.filter((edge) => edge.node.type === "ANIME" && ["SEQUEL", "PREQUEL", "SIDE_STORY", "ALTERNATIVE", "PARENT", "SPIN_OFF"].includes(edge.relationType))
            ?.map((edge) => ({
              id: edge.node.id,
              relationType: edge.relationType,
              title: displayTitle(edge.node),
              status: edge.node.status,
              format: edge.node.format,
              cover: edge.node.coverImage?.large ?? edge.node.coverImage?.extraLarge ?? "",
            })) ?? [];

          if (relations.length === 0) return null;

          return (
            <section className="mt-10 border-t border-border/40 pt-8">
              <h2 className="mb-4 text-xl font-bold">
                <span className="mr-2 inline-block h-5 w-1 rounded bg-accent align-middle" />
                Related Seasons & Series
              </h2>
              <div className="flex flex-wrap gap-4">
                {relations.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/anime/${rel.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3 transition-all hover:border-accent/40 hover:bg-surface-3 cursor-pointer shrink-0 max-w-sm"
                  >
                    {rel.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rel.cover}
                        alt={rel.title}
                        className="h-16 w-11 rounded object-cover shadow-sm shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="inline-block rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        {rel.relationType.replace(/_/g, " ")}
                      </span>
                      <h3 className="mt-1 truncate text-sm font-semibold text-foreground/90">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-muted">
                        {rel.format} · {prettyStatus(rel.status ?? "")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Episodes quick-access */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">
            <span className="mr-2 inline-block h-5 w-1 rounded bg-accent align-middle" />
            Episodes
          </h2>
          <DetailEpisodes animeId={anime.id} totalEpisodes={eps} />
        </section>
      </div>

      {recs.length > 0 && (
        <div className="mt-14">
          <AnimeRow
            title="You might also like"
            items={recs}
            href={anime.genres?.[0] ? `/search?genre=${encodeURIComponent(anime.genres[0])}` : "/search"}
          />
        </div>
      )}
    </div>
  );
}

function prettyStatus(s: string): string {
  return (
    {
      RELEASING: "Airing",
      FINISHED: "Finished",
      NOT_YET_RELEASED: "Upcoming",
      CANCELLED: "Cancelled",
      HIATUS: "Hiatus",
    }[s] ?? s
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

