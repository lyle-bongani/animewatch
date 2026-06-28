"use client";

import { useState } from "react";
import type { Anime } from "@/lib/types";
import { AnimeGrid } from "./AnimeGrid";

type TabId = "isekai" | "trending" | "airing" | "top";

interface HomeTabsProps {
  isekai: Anime[];
  trending: Anime[];
  airing: Anime[];
  topRated: Anime[];
}

export function HomeTabs({ isekai, trending, airing, topRated }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("isekai");

  const tabs = [
    { id: "isekai" as const, label: "Isekai Favorites", count: isekai.length, data: isekai },
    { id: "trending" as const, label: "New & Trending", count: trending.length, data: trending },
    { id: "airing" as const, label: "Airing Now", count: airing.length, data: airing },
    { id: "top" as const, label: "Top Rated", count: topRated.length, data: topRated },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section className="w-full">
      {/* Netflix styled Tab Navigation */}
      <div className="mb-6 border-b border-border/50 pb-2">
        <div className="flex flex-wrap gap-2 sm:gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 text-sm font-semibold tracking-wide transition-all sm:text-base cursor-pointer ${
                  isActive
                    ? "text-accent font-bold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-accent transition-all duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid container with fade-in effect */}
      <div className="transition-opacity duration-300 animate-fadeIn">
        <AnimeGrid items={currentTab.data} />
      </div>
    </section>
  );
}
