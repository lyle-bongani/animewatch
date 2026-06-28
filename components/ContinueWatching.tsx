"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HistoryItem {
  id: number;
  title: string;
  coverImage: string;
  episode: number;
  totalEpisodes: number;
  timestamp: number;
}

export function ContinueWatching() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem("animewatch_history");
        if (stored) {
          const list = JSON.parse(stored) as HistoryItem[];
          // Sort by timestamp desc, limit to 6
          const sorted = list
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 6);
          setHistory(sorted);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadHistory();
    // Refresh history when storage changes
    window.addEventListener("storage", loadHistory);
    window.addEventListener("history-update", loadHistory);

    return () => {
      window.removeEventListener("storage", loadHistory);
      window.removeEventListener("history-update", loadHistory);
    };
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">
          <span className="mr-2 inline-block h-5 w-1 rounded bg-accent align-middle" />
          Continue Watching
        </h2>
        <button
          onClick={() => {
            if (confirm("Clear your watch history?")) {
              localStorage.removeItem("animewatch_history");
              setHistory([]);
            }
          }}
          className="text-xs text-muted hover:text-foreground hover:underline"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {history.map((item) => (
          <Link
            key={item.id}
            href={`/watch/${item.id}?ep=${item.episode}`}
            className="group block"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition-all group-hover:ring-accent">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.coverImage}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute bottom-2 left-2 rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">
                EP {item.episode}
              </span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/40">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <h3 className="mt-2 line-clamp-1 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
              {item.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
