"use client";

import { useEffect, useState, useCallback } from "react";
import { DEFAULT_EXTENSION_REPOS, POPULAR_MANGA_SOURCES, type ExtensionRepo, type MangaSource } from "@/lib/extensions";

const STORAGE_KEY_REPOS = "animewatch_mihon_extension_repos";
const STORAGE_KEY_SOURCES = "animewatch_mihon_disabled_sources";
const STORAGE_KEY_FILTER_NSFW = "animewatch_mihon_filter_nsfw";

export function ExtensionRepoManager() {
  const [repos, setRepos] = useState<ExtensionRepo[]>(DEFAULT_EXTENSION_REPOS);
  const [sources, setSources] = useState<MangaSource[]>(POPULAR_MANGA_SOURCES);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [disabledSources, setDisabledSources] = useState<string[]>([]);
  const [filterNsfw, setFilterNsfw] = useState(true);
  const [selectedLang, setSelectedLang] = useState("all");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load saved repos and preferences from localStorage
  useEffect(() => {
    try {
      const savedRepos = localStorage.getItem(STORAGE_KEY_REPOS);
      if (savedRepos) setRepos(JSON.parse(savedRepos));

      const savedDisabled = localStorage.getItem(STORAGE_KEY_SOURCES);
      if (savedDisabled) setDisabledSources(JSON.parse(savedDisabled));

      const savedNsfwFilter = localStorage.getItem(STORAGE_KEY_FILTER_NSFW);
      if (savedNsfwFilter !== null) setFilterNsfw(savedNsfwFilter === "true");
    } catch {
      /* ignore storage errors */
    }
  }, []);

  // Save changes to localStorage
  const saveRepos = (updatedRepos: ExtensionRepo[]) => {
    setRepos(updatedRepos);
    try {
      localStorage.setItem(STORAGE_KEY_REPOS, JSON.stringify(updatedRepos));
    } catch {}
  };

  const saveDisabledSources = (updatedDisabled: string[]) => {
    setDisabledSources(updatedDisabled);
    try {
      localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(updatedDisabled));
    } catch {}
  };

  const toggleNsfwFilter = (value: boolean) => {
    setFilterNsfw(value);
    try {
      localStorage.setItem(STORAGE_KEY_FILTER_NSFW, String(value));
    } catch {}
  };

  // Sync repositories and fetch available sources
  const syncRepos = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    let allSources: MangaSource[] = [...POPULAR_MANGA_SOURCES];

    for (const repo of repos) {
      try {
        const res = await fetch(`/api/extensions?repoUrl=${encodeURIComponent(repo.url)}`);
        const data = await res.json();
        if (data.success && data.sources) {
          allSources = [...allSources, ...data.sources];
        }
      } catch (err) {
        console.warn(`Failed to sync repo ${repo.url}:`, err);
      }
    }

    // De-duplicate sources by ID
    const uniqueMap = new Map<string, MangaSource>();
    allSources.forEach((s) => uniqueMap.set(s.id, s));
    const finalSources = Array.from(uniqueMap.values());

    setSources(finalSources);
    setLoading(false);
    setStatusMessage(`Successfully synced ${finalSources.length} extension sources from ${repos.length} repository index(es).`);
  }, [repos]);

  useEffect(() => {
    syncRepos();
  }, [syncRepos]);

  // Add new repository URL
  const handleAddRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl.trim()) return;

    const trimmed = newRepoUrl.trim();
    if (repos.some((r) => r.url === trimmed)) {
      setStatusMessage("Repository URL is already added.");
      return;
    }

    const updated = [
      ...repos,
      {
        name: `Custom Extension Repo (${new URL(trimmed).hostname})`,
        url: trimmed,
      },
    ];
    saveRepos(updated);
    setNewRepoUrl("");
    setStatusMessage("New extension repository added successfully!");
  };

  // Remove repository URL
  const handleRemoveRepo = (urlToRemove: string) => {
    const updated = repos.filter((r) => r.url !== urlToRemove);
    saveRepos(updated.length > 0 ? updated : DEFAULT_EXTENSION_REPOS);
  };

  // Toggle individual source on/off
  const toggleSource = (sourceId: string) => {
    const updated = disabledSources.includes(sourceId)
      ? disabledSources.filter((id) => id !== sourceId)
      : [...disabledSources, sourceId];
    saveDisabledSources(updated);
  };

  // Filter sources by NSFW and Language
  const filteredSources = sources.filter((s) => {
    if (filterNsfw && s.isNsfw) return false;
    if (selectedLang !== "all" && s.lang !== selectedLang) return false;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-surface to-surface-2 p-6 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-black">
                Mihon Engine
              </span>
              <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
                Extension Repositories & Manga Sources
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Configure Tachiyomi & Mihon extension repository URLs (`index.pb`) to auto-install, discover, and read manga across Webtoon, Asura, LhScan, Flame Comics, and more.
            </p>
          </div>

          <button
            onClick={syncRepos}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Syncing Index...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Sync Extension Repos
              </>
            )}
          </button>
        </div>

        {statusMessage && (
          <div className="mt-4 rounded-lg bg-surface-3 p-3 text-xs font-semibold text-amber-400 border border-amber-500/20">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Section 1: Add/Manage Extension Repository URLs */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <h2 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Extension Repositories (`index.pb`)
        </h2>
        <p className="text-xs text-muted leading-relaxed mb-4">
          Add Mihon/Tachiyomi repository index links to automatically fetch updated manga extensions.
        </p>

        {/* Form to add URL */}
        <form onSubmit={handleAddRepo} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="url"
            value={newRepoUrl}
            onChange={(e) => setNewRepoUrl(e.target.value)}
            placeholder="https://github.com/keiyoushi/extensions/raw/repo/index.pb"
            className="flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs text-foreground placeholder:text-muted outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
          >
            + Add Extension Repo
          </button>
        </form>

        {/* Repo List */}
        <div className="space-y-2.5">
          {repos.map((repo) => (
            <div
              key={repo.url}
              className="flex items-center justify-between rounded-xl border border-border/80 bg-surface-2/60 p-3.5 transition-colors hover:border-amber-500/40"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-foreground truncate">{repo.name}</span>
                  {repo.isDefault && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-amber-400 border border-amber-500/30">
                      Default Official
                    </span>
                  )}
                </div>
                <code className="mt-0.5 block truncate text-[10px] text-muted font-mono">{repo.url}</code>
              </div>

              {!repo.isDefault && (
                <button
                  onClick={() => handleRemoveRepo(repo.url)}
                  className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  title="Remove Repository"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Installed / Discovered Extension Sources */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Active Extension Sources ({filteredSources.length})
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Enable or disable sources to customize which providers feed into your global manga library.
            </p>
          </div>

          {/* Controls: 18+ Filter & Language Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 18+ Filter Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none bg-surface-2 px-3 py-1.5 rounded-lg border border-border">
              <input
                type="checkbox"
                checked={filterNsfw}
                onChange={(e) => toggleNsfwFilter(e.target.checked)}
                className="rounded accent-amber-500 h-4 w-4"
              />
              <span>Hide 18+ Extensions</span>
            </label>

            {/* Language Selector */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground outline-none focus:border-amber-500"
            >
              <option value="all">All Languages</option>
              <option value="en">English (EN)</option>
              <option value="ja">Japanese (JA)</option>
              <option value="ko">Korean (KO)</option>
              <option value="es">Spanish (ES)</option>
            </select>
          </div>
        </div>

        {/* Source Cards Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSources.map((source) => {
            const isDisabled = disabledSources.includes(source.id);
            return (
              <div
                key={source.id}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  isDisabled
                    ? "border-border/60 bg-surface-2/40 opacity-60"
                    : "border-border bg-surface-2 hover:border-amber-500/50"
                }`}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground truncate">{source.name}</span>
                    <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-muted">
                      {source.lang}
                    </span>
                    {source.isNsfw && (
                      <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/30">
                        18+
                      </span>
                    )}
                  </div>
                  <span className="mt-0.5 block truncate text-[10px] text-muted leading-tight">{source.baseUrl}</span>
                </div>

                <button
                  onClick={() => toggleSource(source.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    isDisabled
                      ? "bg-surface-3 text-muted hover:text-foreground"
                      : "bg-amber-500 text-black hover:bg-amber-400"
                  }`}
                >
                  {isDisabled ? "Disabled" : "Active"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
