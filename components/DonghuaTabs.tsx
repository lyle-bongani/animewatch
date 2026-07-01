"use client";

import { useState } from "react";
import { AnimeRow } from "./AnimeRow";
import { AnimeGrid } from "./AnimeGrid";
import { DonghuaBrowser } from "./DonghuaBrowser";
import type { Anime } from "@/lib/types";

interface DonghuaTabsProps {
  donghuaListTop: Anime[];
  popular2D: Anime[];
  popular3D: Anime[];
  ongoing: Anime[];
}

export function DonghuaTabs({ donghuaListTop, popular2D, popular3D, ongoing }: DonghuaTabsProps) {
  const [activeTab, setActiveTab] = useState<"top200" | "2d" | "3d" | "ongoing" | "explore">("top200");

  return (
    <div className="w-full">
      {/* Netflix-style Tab Headers */}
      <div className="mb-8 border-b border-border/40 pb-px">
        <div className="flex flex-wrap gap-6 text-sm font-semibold sm:gap-8 sm:text-base">
          <button
            onClick={() => setActiveTab("top200")}
            className={`relative pb-3.5 transition-colors cursor-pointer ${
              activeTab === "top200" ? "text-accent font-bold" : "text-muted hover:text-foreground"
            }`}
          >
            Top 200 (DonghuaList)
            {activeTab === "top200" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("2d")}
            className={`relative pb-3.5 transition-colors cursor-pointer ${
              activeTab === "2d" ? "text-accent font-bold" : "text-muted hover:text-foreground"
            }`}
          >
            2D Chinese Anime
            {activeTab === "2d" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("3d")}
            className={`relative pb-3.5 transition-colors cursor-pointer ${
              activeTab === "3d" ? "text-accent font-bold" : "text-muted hover:text-foreground"
            }`}
          >
            3D Chinese Anime (CGI)
            {activeTab === "3d" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("ongoing")}
            className={`relative pb-3.5 transition-colors cursor-pointer ${
              activeTab === "ongoing" ? "text-accent font-bold" : "text-muted hover:text-foreground"
            }`}
          >
            Ongoing / Currently Airing
            {activeTab === "ongoing" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("explore")}
            className={`relative pb-3.5 transition-colors cursor-pointer ${
              activeTab === "explore" ? "text-accent font-bold" : "text-muted hover:text-foreground"
            }`}
          >
            Search & Filter All
            {activeTab === "explore" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="relative z-10 flex flex-col gap-6">
        {activeTab === "top200" && (
          <div>
            <AnimeRow title="Top Ranked Donghua (DonghuaList)" items={donghuaListTop.slice(0, 8)} />
            <div className="mt-8">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-muted">
                All Ranked Masterpieces
              </h3>
              <AnimeGrid items={donghuaListTop.slice(8)} />
            </div>
          </div>
        )}

        {activeTab === "2d" && (
          <div>
            <AnimeRow title="Top 2D Donghua Picks" items={popular2D.slice(0, 8)} />
            <div className="mt-8">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-muted">
                More 2D Chinese Anime
              </h3>
              <AnimeGrid items={popular2D.slice(8)} />
            </div>
          </div>
        )}

        {activeTab === "3d" && (
          <div>
            <AnimeRow title="Top 3D CGI Picks" items={popular3D.slice(0, 8)} />
            <div className="mt-8">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-muted">
                More 3D Chinese CGI
              </h3>
              <AnimeGrid items={popular3D.slice(8)} />
            </div>
          </div>
        )}

        {activeTab === "ongoing" && (
          <div>
            <AnimeRow title="Airing Chinese Series" items={ongoing.slice(0, 8)} />
            <div className="mt-8">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-muted">
                All Ongoing Donghua
              </h3>
              <AnimeGrid items={ongoing.slice(8)} />
            </div>
          </div>
        )}

        {activeTab === "explore" && (
          <div className="animate-fade-in">
            <DonghuaBrowser />
          </div>
        )}
      </div>
    </div>
  );
}
