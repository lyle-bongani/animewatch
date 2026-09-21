"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

export type AppMode = "anime" | "movies" | "series" | "manga";

export interface ModeInfo {
  id: AppMode;
  label: string;
  icon: string;
  tagline: string;
  description: string;
  path: string;
  color: string;
}

export const APP_MODES: Record<AppMode, ModeInfo> = {
  anime: {
    id: "anime",
    label: "Anime",
    icon: "⛩️",
    tagline: "Japanese & Chinese Animation",
    description: "Trending seasonal anime, donghua, movies & isekai sagas",
    path: "/",
    color: "#e50914",
  },
  movies: {
    id: "movies",
    label: "Movies",
    icon: "🎬",
    tagline: "Blockbusters & Cinema",
    description: "Hollywood blockbusters, global cinema, sci-fi & action hits",
    path: "/movies",
    color: "#3b82f6",
  },
  series: {
    id: "series",
    label: "Series",
    icon: "📺",
    tagline: "TV Shows & Dramas",
    description: "Binge-worthy TV series, crime sagas, sitcoms & acclaimed dramas",
    path: "/series",
    color: "#10b981",
  },
  manga: {
    id: "manga",
    label: "Manga",
    icon: "📖",
    tagline: "Manhwa & Webtoons",
    description: "Mihon-style manga catalog, webtoons, comics & instant reader",
    path: "/manga",
    color: "#f59e0b",
  },
};

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode, navigate?: boolean) => void;
  modeInfo: ModeInfo;
  modesList: ModeInfo[];
}

const ModeContext = createContext<ModeContextType>({
  mode: "anime",
  setMode: () => {},
  modeInfo: APP_MODES.anime,
  modesList: Object.values(APP_MODES),
});

export function useAppMode() {
  return useContext(ModeContext);
}

const STORAGE_KEY = "animewatch_mode";

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setModeState] = useState<AppMode>("anime");
  const [mounted, setMounted] = useState(false);

  // Sync mode based on URL pathname
  useEffect(() => {
    setMounted(true);
    if (pathname.startsWith("/movies")) {
      setModeState("movies");
      try {
        localStorage.setItem(STORAGE_KEY, "movies");
      } catch {
        /* ignore */
      }
    } else if (pathname.startsWith("/series")) {
      setModeState("series");
      try {
        localStorage.setItem(STORAGE_KEY, "series");
      } catch {
        /* ignore */
      }
    } else if (pathname.startsWith("/manga")) {
      setModeState("manga");
      try {
        localStorage.setItem(STORAGE_KEY, "manga");
      } catch {
        /* ignore */
      }
    } else if (pathname === "/") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as AppMode | null;
        if (stored && APP_MODES[stored]) {
          setModeState(stored);
        }
      } catch {
        /* ignore */
      }
    }
  }, [pathname]);

  const setMode = useCallback(
    (newMode: AppMode, navigate = false) => {
      setModeState(newMode);
      try {
        localStorage.setItem(STORAGE_KEY, newMode);
      } catch {
        /* ignore */
      }

      if (navigate && typeof window !== "undefined") {
        const targetPath = APP_MODES[newMode].path;
        if (pathname !== targetPath && (pathname === "/" || pathname === "/movies" || pathname === "/series" || pathname === "/manga")) {
          // If already on one of the mode hubs, switch cleanly
          if (pathname !== "/") {
            router.push("/");
          }
        }
      }
    },
    [pathname, router]
  );

  const modeInfo = useMemo(() => APP_MODES[mode] || APP_MODES.anime, [mode]);
  const modesList = useMemo(() => Object.values(APP_MODES), []);

  return (
    <ModeContext.Provider value={{ mode, setMode, modeInfo, modesList }}>
      {children}
    </ModeContext.Provider>
  );
}
