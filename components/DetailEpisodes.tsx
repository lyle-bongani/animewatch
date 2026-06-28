"use client";

import { useState } from "react";
import Link from "next/link";

export function DetailEpisodes({
  animeId,
  totalEpisodes,
}: {
  animeId: number;
  totalEpisodes: number;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const CHUNK_SIZE = 50;

  if (totalEpisodes <= 0) {
    return <p className="text-sm text-muted">Episode list not available yet.</p>;
  }

  // Calculate tabs
  const numTabs = Math.ceil(totalEpisodes / CHUNK_SIZE);
  const tabs = Array.from({ length: numTabs }, (_, i) => {
    const start = i * CHUNK_SIZE + 1;
    const end = Math.min((i + 1) * CHUNK_SIZE, totalEpisodes);
    return { start, end, label: `${start}-${end}` };
  });

  // Get episodes for active tab
  const activeRange = tabs[activeTab];
  const episodes = Array.from(
    { length: activeRange.end - activeRange.start + 1 },
    (_, i) => activeRange.start + i
  );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      {numTabs > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === idx
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {episodes.map((n) => (
          <Link
            key={n}
            href={`/watch/${animeId}?ep=${n}`}
            className="rounded-lg border border-border bg-surface py-2.5 text-center text-sm font-medium transition-colors hover:border-accent hover:bg-surface-2 hover:text-accent"
          >
            {n}
          </Link>
        ))}
      </div>
    </div>
  );
}
